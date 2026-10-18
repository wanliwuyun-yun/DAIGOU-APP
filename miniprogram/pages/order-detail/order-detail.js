// pages/order-detail/order-detail.js
const app = getApp()
const db = wx.cloud.database()
const { formatTime, getOrderStatusInfo, showConfirm, showToast } = require('../../utils/util')

const STATUS_FLOW = {
  intention: { next: 'pending', text: '确认接单', desc: '等待双方确认' },
  pending: { next: 'purchasing', text: '开始代购', desc: '代购者确认中' },
  purchasing: { next: 'shipping', text: '已发货', desc: '正在采购商品' },
  shipping: { next: 'arrived', text: '已到货', desc: '商品运输中' },
  arrived: { next: 'completed', text: '完成交易', desc: '商品已到达' }
}

Page({
  data: { order: {}, canOperate: false, isDaigou: false, isBuyer: false, nextStatusText: '', orderId: '' },

  onLoad(options) {
    this.setData({ orderId: options.id })
    this.loadOrder(options.id)
  },

  async loadOrder(id) {
    try {
      const { data } = await db.collection('orders').doc(id).get()
      const statusInfo = getOrderStatusInfo(data.status)
      const openid = app.globalData.userInfo ? app.globalData.userInfo._openid : ''
      const isDaigou = openid === data.daigouOpenid
      const isBuyer = openid === data.buyerOpenid
      const flow = STATUS_FLOW[data.status]

      this.setData({
        order: { ...data, statusColor: statusInfo.color, statusText: statusInfo.name, statusDesc: statusInfo.desc, createdAtStr: formatTime(data.createdAt) },
        canOperate: isDaigou || isBuyer,
        isDaigou,
        isBuyer,
        nextStatusText: flow ? flow.text : ''
      })
    } catch (err) {
      showToast('订单不存在')
    }
  },

  async nextStatus() {
    const flow = STATUS_FLOW[this.data.order.status]
    if (!flow) return
    const confirmed = await showConfirm(`确认将订单状态更新为"${flow.text}"？`)
    if (!confirmed) return

    try {
      const nextInfo = getOrderStatusInfo(flow.next)
      await db.collection('orders').doc(this.data.orderId).update({
        data: { status: flow.next, statusText: nextInfo.name, updatedAt: db.serverDate() }
      })
      showToast('状态已更新', 'success')
      this.loadOrder(this.data.orderId)
    } catch (err) {
      showToast('更新失败')
    }
  },

  async cancelOrder() {
    const confirmed = await showConfirm('确定取消此订单？')
    if (!confirmed) return
    try {
      await db.collection('orders').doc(this.data.orderId).update({
        data: { status: 'cancelled', statusText: '已取消', updatedAt: db.serverDate() }
      })
      showToast('已取消')
      this.loadOrder(this.data.orderId)
    } catch (err) { showToast('操作失败') }
  },

  openChat() {
    const target = this.data.isDaigou ? this.data.order.buyerOpenid : this.data.order.daigouOpenid
    const name = this.data.isDaigou ? this.data.order.buyerName : this.data.order.daigouName
    wx.navigateTo({ url: `/pages/chat/chat?targetOpenid=${target}&targetName=${name}` })
  },

  goReview() {
    wx.navigateTo({ url: `/pages/review/review?orderId=${this.data.orderId}&type=${this.data.isBuyer ? 'buyer' : 'daigou'}` })
  }
})