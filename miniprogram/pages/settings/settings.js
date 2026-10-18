var app = getApp()
var showToast = require('../../utils/util').showToast
var showConfirm = require('../../utils/util').showConfirm

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    phoneText: '未绑定',
    roleText: '买家'
  },

  onShow: function() {
    var loggedIn = app.globalData.isLoggedIn
    var userInfo = app.globalData.userInfo || {}
    var phone = userInfo.phone || ''
    var phoneText = '未绑定'
    if (phone) {
      phoneText = phone.slice(0, 3) + '****' + phone.slice(7)
    }

    var roleText = '买家'
    if (userInfo.role === 'daigou') {
      roleText = '代购达人'
    } else if (userInfo.role === 'both') {
      roleText = '买家 + 代购达人'
    }
    if (userInfo.applyStatus === 'pending') {
      roleText = roleText + '（审核中）'
    }

    this.setData({
      isLoggedIn: loggedIn,
      userInfo: userInfo,
      phoneText: phoneText,
      roleText: roleText
    })
  },

  onGetUserInfo: function(e) {
    var that = this
    if (e.detail.userInfo) {
      var nickName = e.detail.userInfo.nickName
      var avatarUrl = e.detail.userInfo.avatarUrl
      app.updateUserInfo({
        nickName: nickName,
        avatarUrl: avatarUrl
      })
      app.wxLogin().then(function() {
        that.onShow()
        showToast('登录成功', 'success')
      }).catch(function(err) {
        console.error('登录失败：', err)
        showToast('登录失败，请重试')
      })
    }
  },

  bindPhone: function() {
    var that = this
    // 微信小程序绑定手机号需要用 button 组件的 open-type
    // 这里用一个弹窗提示用户
    wx.showModal({
      title: '绑定手机号',
      content: '请点击确定后授权手机号',
      confirmText: '去授权',
      confirmColor: '#E8734A',
      success: function(res) {
        if (res.confirm) {
          // 实际绑定需要在 wxml 中用 button open-type="getPhoneNumber"
          // 这里跳转到专门的绑定页面或使用全局方法
          showToast('请在登录页使用授权按钮绑定')
        }
      }
    })
  },

  clearCache: function() {
    var that = this
    showConfirm('确定清除缓存？需要重新登录').then(function(confirmed) {
      if (confirmed) {
        wx.removeStorageSync('userInfo')
        app.globalData.userInfo = null
        app.globalData.isLoggedIn = false
        that.onShow()
        showToast('已清除缓存')
      }
    })
  },

  goNotice: function() {
    wx.navigateTo({ url: '/pages/notice/notice' })
  },

  goAgreement: function() {
    wx.navigateTo({ url: '/pages/agreement/agreement' })
  },

  logout: function() {
    var that = this
    showConfirm('确定退出登录？').then(function(confirmed) {
      if (confirmed) {
        wx.removeStorageSync('userInfo')
        app.globalData.userInfo = null
        app.globalData.isLoggedIn = false
        that.onShow()
        showToast('已退出登录')
      }
    })
  }
})