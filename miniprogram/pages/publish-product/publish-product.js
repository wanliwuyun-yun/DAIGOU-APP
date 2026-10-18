// js
const app = getApp()
const { showToast } = require('../../utils/util')
Page({
  data: { isLoggedIn: false, phoneText: '未绑定' },
  onShow() {
    const loggedIn = app.globalData.isLoggedIn
    const phone = (app.globalData.userInfo && app.globalData.userInfo.phone) || ''
    this.setData({ isLoggedIn: loggedIn, phoneText: phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定' })
  },
  async onGetUserInfo(e) {
    if (e.detail.userInfo) {
      app.updateUserInfo({ nickName: e.detail.userInfo.nickName, avatarUrl: e.detail.userInfo.avatarUrl })
      await app.wxLogin()
      this.onShow()
      showToast('登录成功', 'success')
    }
  },
  async onGetPhone(e) {
    const phone = await app.getPhoneNumber(e)
    if (phone) { this.onShow(); showToast('绑定成功', 'success') }
  },
  async bindPhone() {
    // 需要用button组件的open-type，这里提示
    showToast('请使用下方按钮绑定')
  },
  clearCache() { wx.clearStorageSync(); showToast('已清除'); app.globalData.isLoggedIn = false; app.globalData.userInfo = null; this.onShow() },
  goAbout() { wx.navigateTo({ url: '/pages/agreement/agreement' }) }
})