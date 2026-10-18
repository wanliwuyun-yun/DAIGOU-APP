// pages/daigou-detail/daigou-detail.js
const app = getApp()
const db = wx.cloud.database()
const { getRegionName, getCategoryName } = require('../../utils/util')

Page({
  data: { daigouInfo: {}, products: [], productsLeft: [], productsRight: [], isFavorited: false },
  targetOpenid: '',

  onLoad(options) {
    this.targetOpenid = options.id
    this.loadData()
  },

  async loadData() {
    try {
      const { data } = await db.collection('users').where({ _openid: this.targetOpenid }).limit(1).get()
      if (data.length === 0) return

      const daigou = data[0]
      daigou.daigouInfo = daigou.daigouInfo || {}
      daigou.daigouInfo.regionNames = (daigou.daigouInfo.regions || []).map(r => getRegionName(r))
      daigou.daigouInfo.categoryNames = (daigou.daigouInfo.categories || []).map(c => getCategoryName(c))

      this.setData({ daigouInfo: daigou })
      this.checkFavorite()
      this.loadProducts()
    } catch (err) {
      console.error(err)
    }
  },

  async loadProducts() {
    try {
      const { data } = await db.collection('products')
        .where({ _openid: this.targetOpenid, status: '上架' })
        .orderBy('createdAt', 'desc').limit(20).get()
      const left = data.filter((_, i) => i % 2 === 0)
      const right = data.filter((_, i) => i % 2 === 1)
      this.setData({ products: data, productsLeft: left, productsRight: right })
    } catch (err) {}
  },

  async checkFavorite() {
    if (!app.globalData.isLoggedIn) return
    try {
      const { data } = await db.collection('favorites')
        .where({ userId: app.globalData.userInfo._openid, targetOpenid: this.targetOpenid })
        .limit(1).get()
      this.setData({ isFavorited: data.length > 0 })
    } catch (err) {}
  },

  async toggleFavorite() {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({ title: '提示', content: '请先登录', confirmColor: '#E8734A' })
      return
    }
    try {
      if (this.data.isFavorited) {
        await db.collection('favorites').where({
          userId: app.globalData.userInfo._openid, targetOpenid: this.targetOpenid
        }).remove()
        this.setData({ isFavorited: false })
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        await db.collection('favorites').add({
          data: {
            userId: app.globalData.userInfo._openid,
            targetOpenid: this.targetOpenid,
            targetName: this.data.daigouInfo.nickName,
            targetAvatar: this.data.daigouInfo.avatarUrl || '',
            createdAt: db.serverDate()
          }
        })
        this.setData({ isFavorited: true })
        wx.showToast({ title: '已收藏', icon: 'success' })
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  openChat() {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({ title: '提示', content: '请先登录', confirmColor: '#E8734A' })
      return
    }
    wx.navigateTo({
      url: `/pages/chat/chat?targetOpenid=${this.targetOpenid}&targetName=${this.data.daigouInfo.nickName}&targetAvatar=${this.data.daigouInfo.avatarUrl || ''}`
    })
  }
})