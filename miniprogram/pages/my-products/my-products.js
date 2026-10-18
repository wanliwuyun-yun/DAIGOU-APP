// js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: { tab: 'all', list: [] },
  onShow() { this.loadList() },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); this.loadList() },
  async loadList() {
    const where = { _openid: app.globalData.userInfo._openid }
    if (this.data.tab !== 'all') where.status = this.data.tab
    const { data } = await db.collection('products').where(where).orderBy('createdAt', 'desc').limit(50).get()
    this.setData({ list: data })
  },
  async toggleStatus(e) {
    const id = e.currentTarget.dataset.id
    const newStatus = e.currentTarget.dataset.status === '上架' ? '下架' : '上架'
    await db.collection('products').doc(id).update({ data: { status: newStatus } })
    wx.showToast({ title: newStatus === '上架' ? '已上架' : '已下架', icon: 'success' })
    this.loadList()
  },
  goDetail(e) { wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${e.currentTarget.dataset.id}` }) },
  editProduct(e) { wx.navigateTo({ url: `/pages/publish-product/publish-product?id=${e.currentTarget.dataset.id}&mode=edit` }) }
})