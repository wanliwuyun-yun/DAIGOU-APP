// pages/daigou-center/daigou-center.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: { info: {}, productCount: 0 },

  onShow() {
    if (app.globalData.userInfo && app.globalData.userInfo.daigouInfo) {
      this.setData({ info: app.globalData.userInfo.daigouInfo })
      this.loadProductCount()
    }
  },

  async loadProductCount() {
    try {
      const { total } = await db.collection('products').where({ _openid: app.globalData.userInfo._openid, status: '上架' }).count()
      this.setData({ productCount: total })
    } catch (err) {}
  },

  goMyProducts() { wx.navigateTo({ url: '/pages/my-products/my-products' }) },
  goPublishProduct() { wx.navigateTo({ url: '/pages/publish-product/publish-product' }) },
  goMyOrders() { wx.navigateTo({ url: '/pages/my-orders/my-orders?role=daigou' }) },
  goMyReviews() { wx.navigateTo({ url: '/pages/review/review?mode=list' }) },
  goEditInfo() { wx.navigateTo({ url: '/pages/daigou-apply/daigou-apply?mode=edit' }) }
})