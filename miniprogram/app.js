// app.js - 全局应用逻辑
App({
  onLaunch: function () {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: '你的云开发环境ID',
      traceUser: true
    })

    // 检查登录状态
    this.checkLoginStatus()

    // 获取系统信息用于适配
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
    this.globalData.navBarHeight = systemInfo.statusBarHeight + 44
    this.globalData.screenWidth = systemInfo.screenWidth
    this.globalData.screenHeight = systemInfo.screenHeight
    this.globalData.bottomSafeArea = systemInfo.safeArea ? systemInfo.screenHeight - systemInfo.safeArea.bottom : 0
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo._openid) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },

  // 微信静默登录
  async wxLogin() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'login' })
      if (result && result.openid) {
        const userInfo = wx.getStorageSync('userInfo') || {}
        userInfo._openid = result.openid
        wx.setStorageSync('userInfo', userInfo)
        this.globalData.userInfo = userInfo
        this.globalData.isLoggedIn = true
        return result.openid
      }
    } catch (err) {
      console.error('登录失败：', err)
      return null
    }
  },

  // 获取用户手机号
  async getPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') return null
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'login',
        data: { phoneCode: e.detail.code }
      })
      if (result && result.phoneInfo) {
        const userInfo = this.globalData.userInfo || {}
        userInfo.phone = result.phoneInfo.phoneNumber
        wx.setStorageSync('userInfo', userInfo)
        this.globalData.userInfo = userInfo
        return result.phoneInfo.phoneNumber
      }
    } catch (err) {
      console.error('获取手机号失败：', err)
      return null
    }
  },

  // 更新用户信息
  updateUserInfo(data) {
    const userInfo = this.globalData.userInfo || {}
    Object.assign(userInfo, data)
    wx.setStorageSync('userInfo', userInfo)
    this.globalData.userInfo = userInfo
  },

  // 检查是否为代购身份
  isDaigou() {
    const userInfo = this.globalData.userInfo
    return userInfo && (userInfo.role === 'daigou' || userInfo.role === 'both')
  },

  // 检查是否为买家身份
  isBuyer() {
    const userInfo = this.globalData.userInfo
    return userInfo && (userInfo.role === 'buyer' || userInfo.role === 'both')
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    statusBarHeight: 20,
    navBarHeight: 64,
    screenWidth: 375,
    screenHeight: 812,
    bottomSafeArea: 0
  }
})