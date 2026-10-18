/**
 * 通用工具函数
 */

// 格式化价格
function formatPrice(price) {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}

// 生成订单编号
function generateOrderId() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const sec = String(now.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `DG${year}${month}${day}${hour}${min}${sec}${random}`
}

// 格式化时间
function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${min}`
}

// 相对时间
function timeAgo(date) {
  if (!date) return ''
  const now = new Date().getTime()
  const past = new Date(date).getTime()
  const diff = now - past

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return formatTime(date).split(' ')[0]
}

// 获取地区名称
function getRegionName(regionId) {
  const { REGIONS } = require('./config')
  for (const group of REGIONS) {
    for (const region of group.children) {
      if (region.id === regionId) return region.name
    }
  }
  return regionId || '未知地区'
}

// 获取地区分组名称
function getRegionGroupName(regionId) {
  const { REGIONS } = require('./config')
  for (const group of REGIONS) {
    for (const region of group.children) {
      if (region.id === regionId) return group.name
    }
  }
  return ''
}

// 获取品类名称
function getCategoryName(categoryId) {
  const { CATEGORIES } = require('./config')
  const cat = CATEGORIES.find(c => c.id === categoryId)
  return cat ? cat.name : categoryId || '未分类'
}

// 获取所有地区（扁平化）
function getAllRegions() {
  const { REGIONS } = require('./config')
  const list = []
  REGIONS.forEach(group => {
    list.push({ id: group.id, name: group.name, isGroup: true })
    group.children.forEach(region => {
      list.push({ id: region.id, name: region.name, flag: region.flag, groupId: group.id })
    })
  })
  return list
}

// 获取订单状态信息
function getOrderStatusInfo(statusKey) {
  const { ORDER_STATUS } = require('./config')
  return ORDER_STATUS[statusKey.toUpperCase()] || { name: '未知', color: '#8E8E93' }
}

// 获取需求状态信息
function getDemandStatusInfo(statusKey) {
  const { DEMAND_STATUS } = require('./config')
  return DEMAND_STATUS[statusKey.toUpperCase()] || { name: '未知', color: '#8E8E93' }
}

// 显示提示
function showToast(title, icon = 'none') {
  wx.showToast({ title, icon, duration: 2000 })
}

// 显示加载
function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true })
}

// 隐藏加载
function hideLoading() {
  wx.hideLoading()
}

// 确认弹窗
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmColor: '#E8734A',
      success: (res) => resolve(res.confirm)
    })
  })
}

// 上传图片
function chooseAndUploadImage(count = 1) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: async (res) => {
        showLoading('上传中...')
        try {
          const tempFilePaths = res.tempFiles.map(f => f.tempFilePath)
          const uploadTasks = tempFilePaths.map(path => {
            return new Promise((resolveUpload, rejectUpload) => {
              const cloudPath = `images/${Date.now()}_${Math.random().toString(36).substr(2, 8)}${path.match(/\.\w+$/)[0]}`
              wx.cloud.uploadFile({
                cloudPath,
                filePath: path,
                success: (uploadRes) => resolveUpload(uploadRes.fileID),
                fail: rejectUpload
              })
            })
          })
          const results = await Promise.all(uploadTasks)
          hideLoading()
          resolve(results)
        } catch (err) {
          hideLoading()
          reject(err)
        }
      },
      fail: reject
    })
  })
}

// 防抖
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 节流
function throttle(fn, delay = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

module.exports = {
  formatPrice,
  generateOrderId,
  formatTime,
  timeAgo,
  getRegionName,
  getRegionGroupName,
  getCategoryName,
  getAllRegions,
  getOrderStatusInfo,
  getDemandStatusInfo,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  chooseAndUploadImage,
  debounce,
  throttle
}