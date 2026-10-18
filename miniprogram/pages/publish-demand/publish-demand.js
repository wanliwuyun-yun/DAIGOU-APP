var app = getApp()
var config = require('../../utils/config')
var REGIONS = config.REGIONS
var CATEGORIES = config.CATEGORIES
var util = require('../../utils/util')
var showToast = util.showToast
var showLoading = util.showLoading
var hideLoading = util.hideLoading
var showConfirm = util.showConfirm
var chooseAndUploadImage = util.chooseAndUploadImage
var db = wx.cloud.database()

Page({
  data: {
    form: {
      productName: '',
      productLink: '',
      images: [],
      region: '',
      regionName: '',
      category: '',
      categoryName: '',
      budget: '',
      quantity: 1,
      expectTime: '',
      allowGroupBuy: false,
      note: ''
    },
    categories: CATEGORIES,
    regionPicker: [],
    regionPickerValue: [0, 0],
    today: '',
    submitting: false
  },

  onLoad: function() {
    var now = new Date()
    var year = now.getFullYear()
    var month = String(now.getMonth() + 1).padStart(2, '0')
    var day = String(now.getDate()).padStart(2, '0')
    this.setData({ today: year + '-' + month + '-' + day })

    var regionPicker = [REGIONS.map(function(r) {
      return { name: r.name, id: r.id }
    })]
    if (REGIONS.length > 0) {
      regionPicker.push(REGIONS[0].children.map(function(r) {
        return { name: r.name, id: r.id }
      }))
    }
    this.setData({ regionPicker: regionPicker })
  },

  onInput: function(e) {
    var field = e.currentTarget.dataset.field
    var value = e.detail.value
    var obj = {}
    obj['form.' + field] = value
    this.setData(obj)
  },

  onRegionColumnChange: function(e) {
    var column = e.detail.column
    var value = e.detail.value
    var regionPicker = this.data.regionPicker
    var regionPickerValue = this.data.regionPickerValue

    if (column === 0) {
      regionPickerValue[0] = value
      regionPickerValue[1] = 0
      regionPicker[1] = REGIONS[value].children.map(function(r) {
        return { name: r.name, id: r.id }
      })
      this.setData({ regionPicker: regionPicker, regionPickerValue: regionPickerValue })
    }
  },

  onRegionPick: function(e) {
    var regionPicker = this.data.regionPicker
    var regionPickerValue = this.data.regionPickerValue
    var groupIndex = regionPickerValue[0]
    var regionIndex = regionPickerValue[1]
    var region = regionPicker[1][regionIndex]
    var groupName = regionPicker[0][groupIndex].name

    var obj1 = {}
    obj1['form.region'] = region.id
    this.setData(obj1)

    var obj2 = {}
    obj2['form.regionName'] = groupName + ' · ' + region.name
    this.setData(obj2)
  },

  onCategoryPick: function(e) {
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name

    var obj1 = {}
    obj1['form.category'] = id
    this.setData(obj1)

    var obj2 = {}
    obj2['form.categoryName'] = name
    this.setData(obj2)
  },

  changeQty: function(e) {
    var delta = e.currentTarget.dataset.delta
    var qty = parseInt(this.data.form.quantity) || 1
    if (qty + delta < 1) {
      qty = 1
    } else {
      qty = qty + delta
    }
    var obj = {}
    obj['form.quantity'] = qty
    this.setData(obj)
  },

  onSwitch: function(e) {
    var field = e.currentTarget.dataset.field
    var obj = {}
    obj['form.' + field] = e.detail.value
    this.setData(obj)
  },

  addImage: function() {
    var that = this
    var remaining = 9 - this.data.form.images.length
    if (remaining <= 0) {
      return
    }
    chooseAndUploadImage(remaining).then(function(urls) {
      var images = that.data.form.images.concat(urls)
      var obj = {}
      obj['form.images'] = images
      that.setData(obj)
    }).catch(function(err) {
      console.log('取消上传')
    })
  },

  removeImage: function(e) {
    var index = e.currentTarget.dataset.index
    var images = this.data.form.images.concat([])
    images.splice(index, 1)
    var obj = {}
    obj['form.images'] = images
    this.setData(obj)
  },

  goNotice: function() {
    wx.navigateTo({ url: '/pages/notice/notice' })
  },

  submitForm: function() {
    var that = this
    var form = this.data.form

    if (!form.productName.trim()) {
      showToast('请输入商品名称')
      return
    }
    if (!form.region) {
      showToast('请选择代购地区')
      return
    }
    if (!form.category) {
      showToast('请选择商品分类')
      return
    }
    if (form.budget === '' || form.budget === undefined) {
      showToast('请输入预算金额')
      return
    }

    showConfirm('确认发布此代购需求？').then(function(confirmed) {
      if (!confirmed) {
        return
      }
      that.doSubmit(form)
    })
  },

  doSubmit: function(form) {
    var that = this
    this.setData({ submitting: true })
    showLoading('发布中...')

    db.collection('demands').add({
      data: {
        productName: form.productName.trim(),
        productLink: form.productLink || '',
        images: form.images,
        region: form.region,
        regionName: form.regionName,
        category: form.category,
        categoryName: form.categoryName,
        budget: parseFloat(form.budget) || 0,
        quantity: parseInt(form.quantity) || 1,
        expectTime: form.expectTime || '',
        allowGroupBuy: form.allowGroupBuy,
        note: form.note || '',
        status: 'waiting',
        viewCount: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    }).then(function() {
      hideLoading()
      showToast('发布成功', 'success')
      that.setData({
        form: {
          productName: '',
          productLink: '',
          images: [],
          region: '',
          regionName: '',
          category: '',
          categoryName: '',
          budget: '',
          quantity: 1,
          expectTime: '',
          allowGroupBuy: false,
          note: ''
        },
        submitting: false
      })
      setTimeout(function() {
        wx.navigateBack()
      }, 1500)
    }).catch(function(err) {
      hideLoading()
      console.error('发布失败：', err)
      showToast('发布失败，请重试')
      that.setData({ submitting: false })
    })
  }
})