// pages/product-detail/product-detail.js
const app = getApp()
const db = wx.cloud.database()
const { getRegionName, getCategoryName, generateOrderId, showToast, showConfirm } = require('../../utils/util')

Page({
  data: { product: {} },

  onLoad(options) {
    if (options.id) this.loadProduct(options.id)
  },

  async loadProduct(id) {
    try {
      const { data } = await db.collection('products').doc(id).get()
      const product = {
        ...data,
        regionName: getRegionName(data.region),
        categoryName: getCategoryName(data.category)
      }
      // 获取代购者信息
      const { data: users } = await db.collection('users').where({ _openid: data._openid }).limit(1).get()
      if (users.length > 0) {
        product.daigouName = users[0].nickName
        product.daigouAvatar = users[0].avatarUrl
      }
      // 增加浏览量
      db.collection('products').doc(id).update({ data: { viewCount: db.command.inc(1) } })
      this.setData({ product })
    } catch (err) {
      console.error(err)
      showToast('商品不存在')
    }
  },

  previewImage(e) {
    wx.previewImage({ urls: this.data.product.images, current: e.currentTarget.dataset.src })
  },

  goDaigou() {
    wx.navigateTo({ url: `/pages/daigou-detail/daigou-detail?id=${this.data.product._openid}` })
  },

  openChat() {
    if (!app.globalData.isLoggedIn) { wx.showModal({ title: '提示', content: '请先登录', confirmColor: '#E8734A' }); return }
    wx.navigateTo({
      url: `/pages/chat/chat?targetOpenid=${this.data.product._openid}&targetName=${this.data.product.daigouName}&targetAvatar=${this.data.product.daigouAvatar || ''}`
    })
  },

  async createOrder() {
    if (!app.globalData.isLoggedIn) { wx.showModal({ title: '提示', content: '请先登录', confirmColor: '#E8734A' }); return }
    const confirmed = await showConfirm('确认下单？下单后请与代购者沟通确认细节。')
    if (!confirmed) return

    try {
      const p = this.data.product
      const orderId = generateOrderId()
      await db.collection('orders').add({
        data: {
          orderId,
          type: 'product',
          productId: p._id,
          productName: p.name,
          productImages: p.images,
          region: p.region,
          regionName: p.regionName,
          category: p.category,
          categoryName: p.categoryName,
          price: p.price,
          serviceFee: p.serviceFee || 0,
          shippingNote: p.shippingNote || '',
          quantity: 1,
          totalAmount: (p.price || 0) + (p.serviceFee || 0),
          buyerOpenid: app.globalData.userInfo._openid,
          buyerName: app.globalData.userInfo.nickName || '买家',
          daigouOpenid: p._openid,
          daigouName: p.daigouName || '代购者',
          status: 'intention',
          statusText: '意向订单',
          remark: '',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
      showToast('下单成功', 'success')
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/order/order' })
      }, 1500)
    } catch (err) {
      console.error(err)
      showToast('下单失败')
    }
  }
})