const app = getApp()
const db = wx.cloud.database()
const { formatTime, getOrderStatusInfo } = require('../../utils/util')

Page({
  data: { currentTab: 'all', orderList: [], loading: false, noMore: false, page: 0, pageSize: 10 },

  onLoad() { this.loadOrders() },
  onShow() { this.setData({ page: 0, orderList: [], noMore: false }); this.loadOrders() },
  onReachBottom() { if (!this.data.noMore && !this.data.loading) this.loadOrders() },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab, page: 0, orderList: [], noMore: false })
    this.loadOrders()
  },

  async loadOrders() {
    if (this.data.loading || !app.globalData.isLoggedIn) return
    this.setData({ loading: true })
    try {
      const openid = app.globalData.userInfo._openid
      let where = db.command.or([{ buyerOpenid: openid }, { daigouOpenid: openid }])
      if (this.data.currentTab !== 'all') {
        where = db.command.and([where, { status: this.data.currentTab }])
      }

      const { data } = await db.collection('orders')
        .where(where).orderBy('createdAt', 'desc')
        .skip(this.data.page * this.data.pageSize).limit(this.data.pageSize).get()

      const list = data.map(o => {
        const statusInfo = getOrderStatusInfo(o.status)
        return { ...o, statusColor: statusInfo.color, statusText: statusInfo.name, createdAtStr: formatTime(o.createdAt) }
      })

      this.setData({
        orderList: [...this.data.orderList, ...list],
        page: this.data.page + 1,
        noMore: data.length < this.data.pageSize,
        loading: false
      })
    } catch (err) {
      this.setData({ loading: false })
    }
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${e.currentTarget.dataset.id}` })
  }
})