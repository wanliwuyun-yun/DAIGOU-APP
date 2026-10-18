const app = getApp()
const { REGIONS, CATEGORIES } = require('../../utils/config')
const { showToast, showConfirm } = require('../../utils/util')
const db = wx.cloud.database()

Page({
  data: {
    regions: REGIONS,
    categories: CATEGORIES,
    form: {
      realName: '',
      wechat: '',
      regions: [],
      categories: [],
      description: ''
    },
    submitting: false
  },

  onInput(e) {
    var field = e.currentTarget.dataset.field
    this.setData({
      ['form.' + field]: e.detail.value
    })
  },

  toggleRegion(e) {
    var id = e.currentTarget.dataset.id
    var regions = this.data.form.regions.concat([])
    var idx = regions.indexOf(id)
    if (idx > -1) {
      regions.splice(idx, 1)
    } else {
      regions.push(id)
    }
    this.setData({ 'form.regions': regions })
  },

  toggleCategory(e) {
    var id = e.currentTarget.dataset.id
    var categories = this.data.form.categories.concat([])
    var idx = categories.indexOf(id)
    if (idx > -1) {
      categories.splice(idx, 1)
    } else {
      categories.push(id)
    }
    this.setData({ 'form.categories': categories })
  },

  async submit() {
    var f = this.data.form
    if (!f.realName.trim()) {
      showToast('请输入真实姓名')
      return
    }
    if (f.regions.length === 0) {
      showToast('请选择代购地区')
      return
    }
    if (f.categories.length === 0) {
      showToast('请选择主营品类')
      return
    }
    if (!f.description.trim()) {
      showToast('请填写服务简介')
      return
    }

    var confirmed = await showConfirm('确认提交代购申请？')
    if (!confirmed) return

    this.setData({ submitting: true })
    try {
      await db.collection('users').where({
        _openid: app.globalData.userInfo._openid
      }).update({
        data: {
          role: 'both',
          applyStatus: 'pending',
          applyTime: db.serverDate(),
          daigouInfo: {
            realName: f.realName.trim(),
            wechat: f.wechat || '',
            regions: f.regions,
            categories: f.categories,
            description: f.description.trim(),
            orderCount: 0,
            rating: 5.0,
            reviewCount: 0
          }
        }
      })
      app.updateUserInfo({
        role: 'both',
        applyStatus: 'pending',
        daigouInfo: {
          regions: f.regions,
          categories: f.categories,
          description: f.description.trim(),
          orderCount: 0,
          rating: 5.0,
          reviewCount: 0
        }
      })
      showToast('申请已提交', 'success')
      setTimeout(function() {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      showToast('提交失败')
    }
    this.setData({ submitting: false })
  }
})