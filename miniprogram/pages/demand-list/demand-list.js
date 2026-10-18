const app = getApp()
const { timeAgo } = require('../../utils/util')
const db = wx.cloud.database()

Page({
  data: {
    currentRegion: 'all',
    currentStatus: 'all',
    sort: 'newest',
    demandList: [],
    loading: false,
    noMore: false,
    page: 0,
    pageSize: 10,
    isDaigouOnly: false
  },

  onLoad() {
    this.setData({ isDaigouOnly: app.isDaigou() && !app.isBuyer() })
    this.loadDemands()
  },

  onShow() {
    this.setData({ isDaigouOnly: app.isDaigou() && !app.isBuyer() })
  },

  onPullDownRefresh() {
    this.setData({ page: 0, noMore: false, demandList: [] })
    this.loadDemands().then(() => wx.stopPullDownRefresh()).catch(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) this.loadDemands()
  },

  onRegionChange(e) {
    this.setData({ currentRegion: e.detail.id, page: 0, noMore: false, demandList: [] })
    this.loadDemands()
  },

  onStatusChange(e) {
    this.setData({ currentStatus: e.currentTarget.dataset.status, page: 0, noMore: false, demandList: [] })
    this.loadDemands()
  },

  onSortChange(e) {
    this.setData({ sort: e.currentTarget.dataset.sort, page: 0, noMore: false, demandList: [] })
    this.loadDemands()
  },

  async loadDemands() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { currentRegion, currentStatus, sort, page, pageSize } = this.data
      let where = {}

      if (currentRegion !== 'all') where.region = currentRegion
      if (currentStatus !== 'all') where.status = currentStatus

      let orderBy = 'createdAt'
      let order = 'desc'
      if (sort === 'hot') { orderBy = 'viewCount'; order = 'desc' }
      if (sort === 'budgetHigh') { orderBy = 'budget'; order = 'desc' }

      const { data } = await db.collection('demands')
        .where(where)
        .orderBy(orderBy, order)
        .skip(page * pageSize)
        .limit(pageSize)
        .get()

      // 补充用户信息
      const enriched = await Promise.all(data.map(async (item) => {
        let userInfo = { nickName: '匿名用户', avatarUrl: '' }
        try {
          const userRes = await db.collection('users').where({ _openid: item._openid }).field({ nickName: true, avatarUrl: true }).limit(1).get()
          if (userRes.data.length > 0) userInfo = userRes.data[0]
        } catch (e) {}
        return { ...item, userInfo, timeAgo: timeAgo(item.createdAt) }
      }))

      this.setData({
        demandList: [...this.data.demandList, ...enriched],
        page: page + 1,
        noMore: data.length < pageSize,
        loading: false
      })
    } catch (err) {
      console.error('加载需求失败：', err)
      this.setData({ loading: false })
    }
  },

  publishDemand() {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmColor: '#E8734A',
        success: (res) => { if (res.confirm) wx.navigateTo({ url: '/pages/profile/profile' }) }
      })
      return
    }
    wx.navigateTo({ url: '/pages/publish-demand/publish-demand' })
  }
})