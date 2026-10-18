const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const { formatTime, getOrderStatusInfo } = require('../../utils/util')

Page({
  data: {
    currentTab: 'all',
    role: 'all',
    orderList: [],
    loading: false,
    noMore: false,
    page: 0,
    pageSize: 10
  },

  onLoad: function(options) {
    if (options.role) {
      this.setData({ role: options.role })
    }
    this.loadOrders()
  },

  onShow: function() {
    this.setData({
      page: 0,
      orderList: [],
      noMore: false
    })
    this.loadOrders()
  },

  onReachBottom: function() {
    if (!this.data.noMore && !this.data.loading) {
      this.loadOrders()
    }
  },

  switchTab: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab,
      page: 0,
      orderList: [],
      noMore: false
    })
    this.loadOrders()
  },

  loadOrders: function() {
    if (this.data.loading) return
    if (!app.globalData.isLoggedIn) return

    this.setData({ loading: true })

    var openid = app.globalData.userInfo._openid
    var where = {}

    // 根据角色筛选
    if (this.data.role === 'daigou') {
      where.daigouOpenid = openid
    } else if (this.data.role === 'buyer') {
      where.buyerOpenid = openid
    } else {
      where = _.or([
        { buyerOpenid: openid },
        { daigouOpenid: openid }
      ])
    }

    // 根据状态筛选
    if (this.data.currentTab !== 'all') {
      var statusFilter = { status: this.data.currentTab }
      if (where.$or) {
        where = _.and([where, statusFilter])
      } else {
        where.status = this.data.currentTab
      }
    }

    db.collection('orders')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip(this.data.page * this.data.pageSize)
      .limit(this.data.pageSize)
      .get()
      .then(function(res) {
        var data = res.data || []
        var openid2 = app.globalData.userInfo._openid
        var list = data.map(function(o) {
          var statusInfo = getOrderStatusInfo(o.status)
          var myRole = 'buyer'
          if (openid2 === o.daigouOpenid) {
            myRole = 'daigou'
          }
          return {
            _id: o._id,
            orderId: o.orderId,
            productName: o.productName,
            productImages: o.productImages || [],
            regionName: o.regionName || '',
            price: o.price,
            budget: o.budget,
            totalAmount: o.totalAmount,
            status: o.status,
            statusColor: statusInfo.color,
            statusText: statusInfo.name,
            myRole: myRole,
            createdAtStr: formatTime(o.createdAt)
          }
        })

        var oldList = this.data.orderList.concat(list)
        var newPage = this.data.page + 1
        var isNoMore = data.length < this.data.pageSize

        this.setData({
          orderList: oldList,
          page: newPage,
          noMore: isNoMore,
          loading: false
        })
      }.bind(this))
      .catch(function(err) {
        console.error('加载订单失败：', err)
        this.setData({ loading: false })
      }.bind(this))
  },

  goDetail: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?id=' + id
    })
  }
})