const app = getApp()
const { showConfirm, showToast } = require('../../utils/util')

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    isBuyer: false,
    isDaigou: false
  },

  onShow() {
    this.refreshStatus()
  },

  refreshStatus() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo,
      isBuyer: app.isBuyer(),
      isDaigou: app.isDaigou()
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/settings/settings?mode=login' })
  },

  goApply() { wx.navigateTo({ url: '/pages/daigou-apply/daigou-apply' }) },
  goDaigouCenter() { wx.navigateTo({ url: '/pages/daigou-center/daigou-center' }) },
  goMyDemands() {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/my-demands/my-demands' })
  },
  goMyOrders() {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/my-orders/my-orders' })
  },
  goFavorites() {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/favorites/favorites' })
  },
  goNotice() { wx.navigateTo({ url: '/pages/notice/notice' }) },
  goAgreement() { wx.navigateTo({ url: '/pages/agreement/agreement' }) },
  goSettings() { wx.navigateTo({ url: '/pages/settings/settings' }) },

  checkLogin() {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({ title: '提示', content: '请先登录', confirmColor: '#E8734A',
        success: (res) => { if (res.confirm) wx.navigateTo({ url: '/pages/settings/settings?mode=login' }) }
      })
      return false
    }
    return true
  },

  async logout() {
    const confirmed = await showConfirm('确定退出登录？')
    if (!confirmed) return
    wx.removeStorageSync('userInfo')
    app.globalData.userInfo = null
    app.globalData.isLoggedIn = false
    this.refreshStatus()
    showToast('已退出登录')
  }
})