// js
const app = getApp()
const { timeAgo, showToast } = require('../../utils/util')
const db = wx.cloud.database()
Page({
  data: { mode: 'write', rating: 5, content: '', orderId: '', type: '', reviews: [] },
  onLoad(options) {
    if (options.mode === 'list') {
      this.setData({ mode: 'list' })
      this.loadReviews()
    } else {
      this.setData({ mode: 'write', orderId: options.orderId, type: options.type })
    }
  },
  setRating(e) { this.setData({ rating: e.currentTarget.dataset.val }) },
  onInput(e) { this.setData({ content: e.detail.value }) },
  async submitReview() {
    if (!this.data.content.trim()) { showToast('请填写评价内容'); return }
    try {
      await db.collection('reviews').add({
        data: {
          orderId: this.data.orderId,
          reviewerOpenid: app.globalData.userInfo._openid,
          reviewerName: app.globalData.userInfo.nickName || '用户',
          type: this.data.type,
          rating: this.data.rating,
          content: this.data.content.trim(),
          createdAt: db.serverDate()
        }
      })
      await db.collection('orders').doc(this.data.orderId).update({ data: { reviewed: true } })
      showToast('评价成功', 'success')
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) { showToast('评价失败') }
  },
  async loadReviews() {
    const { data } = await db.collection('reviews').orderBy('createdAt', 'desc').limit(50).get()
    this.setData({ reviews: data.map(r => ({ ...r, timeAgo: timeAgo(r.createdAt) })) })
  }
})