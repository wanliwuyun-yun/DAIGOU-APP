// 首页逻辑
const app = getApp()
const { REGIONS, CATEGORIES, BANNERS } = require('../../utils/config')
const { timeAgo, showLoading, hideLoading } = require('../../utils/util')
const db = wx.cloud.database()

Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    banners: BANNERS,
    regions: REGIONS,
    categories: CATEGORIES,
    daigouList: [],
    demandList: [],
    productsLeft: [],
    productsRight: [],
    loading: false,
    noMore: false,
    isDaigou: false,
    isBuyerOnly: false,
    showPublishSheet: false,
    page: 0,
    pageSize: 6
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      navBarHeight: app.globalData.navBarHeight
    })
    this.loadDaigouList()
    this.loadDemandList()
    this.loadProducts()
  },

  onShow() {
    this.setData({
      isDaigou: app.isDaigou(),
      isBuyerOnly: app.isBuyer() && !app.isDaigou()
    })
  },

  onPullDownRefresh() {
    this.setData({ page: 0, noMore: false, productsLeft: [], productsRight: [] })
    Promise.all([
      this.loadDaigouList(),
      this.loadDemandList(),
      this.loadProducts()
    ]).then(() => wx.stopPullDownRefresh()).catch(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (!this.data.noMore) {
      this.loadProducts()
    }
  },

  // 加载推荐代购达人
  async loadDaigouList() {
    try {
      const { data } = await db.collection('users')
        .where({ role: db.command.in(['daigou', 'both']), applyStatus: 'approved' })
        .orderBy('daigouInfo.orderCount', 'desc')
        .limit(10)
        .get()
      this.setData({ daigouList: data })
    } catch (err) {
      console.error('加载代购列表失败：', err)
    }
  },

  // 加载最新需求
  async loadDemandList() {
    try {
      const { data } = await db.collection('demands')
        .where({ status: 'waiting' })
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
      // 补充用户信息和时间
      const enriched = await Promise.all(data.map(async (item) => {
        let userInfo = { nickName: '匿名用户', avatarUrl: '' }
        try {
          const userRes = await db.collection('users').where({ _openid: item._openid }).limit(1).get()
          if (userRes.data.length > 0) {
            userInfo = userRes.data[0]
          }
        } catch (e) {}
        return {
          ...item,
          userInfo,
          timeAgo: timeAgo(item.createdAt)
        }
      }))
      this.setData({ demandList: enriched })
    } catch (err) {
      console.error('加载需求列表失败：', err)
    }
  },

  // 加载商品（瀑布流）
  async loadProducts() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { page, pageSize } = this.data
      const { data } = await db.collection('products')
        .where({ status: '上架' })
        .orderBy('viewCount', 'desc')
        .skip(page * pageSize)
        .limit(pageSize)
        .get()

      const left = []
      const right = []
      data.forEach((item, index) => {
        if (index % 2 === 0) {
          left.push(item)
        } else {
          right.push(item)
        }
      })

      this.setData({
        productsLeft: [...this.data.productsLeft, ...left],
        productsRight: [...this.data.productsRight, ...right],
        page: page + 1,
        noMore: data.length < pageSize,
        loading: false
      })
    } catch (err) {
      console.error('加载商品失败：', err)
      this.setData({ loading: false })
    }
  },

  // 跳转搜索
  goSearch() {
    wx.navigateTo({ url: '/pages/category/category?mode=search' })
  },

  // 地区点击
  onRegionTap(e) {
    const group = e.currentTarget.dataset.group
    wx.navigateTo({ url: `/pages/category/category?groupId=${group.id}` })
  },

  // 品类点击
  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/product-list/product-list?category=${id}` })
  },

  // Banner 点击
  onBannerTap(e) {
    const banner = e.currentTarget.dataset.banner
    if (banner.title.includes('须知') || banner.title.includes('规则')) {
      wx.navigateTo({ url: '/pages/notice/notice' })
    } else if (banner.title.includes('代购达人') || banner.title.includes('成为')) {
      if (app.isDaigou()) {
        wx.switchTab({ url: '/pages/profile/profile' })
      } else {
        wx.navigateTo({ url: '/pages/daigou-apply/daigou-apply' })
      }
    }
  },

  // 导航跳转
  goCategory() { wx.switchTab({ url: '/pages/category/category' }) },
  goDaigouList() { wx.navigateTo({ url: '/pages/daigou-list/daigou-list' }) },
  goDemandList() { wx.switchTab({ url: '/pages/demand-list/demand-list' }) },
  goProductList() { wx.navigateTo({ url: '/pages/product-list/product-list' }) },
  goDaigouDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/daigou-detail/daigou-detail?id=${id}` })
  },
  goDemandDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/demand-detail/demand-detail?id=${id}` })
  },

  // 发布浮动按钮
  onFabTap() {
    // 检查登录
    if (!app.globalData.isLoggedIn) {
      this.needLogin()
      return
    }
    this.setData({ showPublishSheet: true })
  },

  closePublishSheet() {
    this.setData({ showPublishSheet: false })
  },

  publishDemand() {
    this.setData({ showPublishSheet: false })
    wx.navigateTo({ url: '/pages/publish-demand/publish-demand' })
  },

  publishProduct() {
    this.setData({ showPublishSheet: false })
    wx.navigateTo({ url: '/pages/publish-product/publish-product' })
  },

  goApply() {
    this.setData({ showPublishSheet: false })
    wx.navigateTo({ url: '/pages/daigou-apply/daigou-apply' })
  },

  // 需要登录
  needLogin() {
    wx.showModal({
      title: '提示',
      content: '请先登录后再操作',
      confirmText: '去登录',
      confirmColor: '#E8734A',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/profile/profile' })
        }
      }
    })
  }
})