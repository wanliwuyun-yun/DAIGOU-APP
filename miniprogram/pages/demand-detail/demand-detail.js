// pages/demand-detail/demand-detail.js
const app = getApp()
const db = wx.cloud.database()
const { timeAgo, getRegionName, getCategoryName, getDemandStatusInfo, showConfirm, showToast } = require('../../utils/util')

Page({
  data: { demand: {}, userInfo: {}, statusInfo: {}, timeAgo: '', isOwner: false, isDaigou: false },

  onLoad(options) {
    if (options.id) this.loadDemand(options.id)
  },

  async loadDemand(id) {
    try {
      const { data } = await db.collection('demands').doc(id).get()
      let userInfo = { nickName: '匿名用户', avatarUrl: '' }
      try {
        const uRes = await db.collection('users').where({ _openid: data._openid }).field({ nickName: true, avatarUrl: true }).limit(1).get()
        if (uRes.data.length > 0) userInfo = uRes.data[0]
      } catch (e) {}

      const demand = {
        ...data,
        regionName: getRegionName(data.region),
        categoryName: getCategoryName(data.category),
        userInfo
      }

      const isOwner = app.globalData.isLoggedIn && app.globalData.userInfo._openid === data._openid

      this.setData({
        demand,
        statusInfo: getDemandStatusInfo(data.status),
        timeAgo: timeAgo(data.createdAt),
        isOwner,
        isDaigou: app.isDaigou()
      })
    } catch (err) {
      showToast('需求不存在')
    }
  },

  previewImage(e) {
    wx.previewImage({ urls: this.data.demand.images, current: e.currentTarget.dataset.src })
  },

  async acceptDemand() {
    const confirmed = await showConfirm('确认接单？接单后请尽快联系买家沟通。')
    if (!confirmed) return

    try {
      await db.collection('demands').doc(this.data.demand._id).update({
        data: { status: 'accepted', updatedAt: db.serverDate() }
      })

      // 创建意向订单
      const { generateOrderId } = require('../../utils/util')
      await db.collection('orders').add({
        data: {
          orderId: generateOrderId(),
          type: 'demand',
          demandId: this.data.demand._id,
          productName: this.data.demand.productName,
          productImages: this.data.demand.images,
          region: this.data.demand.region,
          regionName: this.data.demand.regionName,
          budget: this.data.demand.budget,
          quantity: this.data.demand.quantity,
          buyerOpenid: this.data.demand._openid,
          buyerName: this.data.demand.userInfo.nickName || '买家',
          daigouOpenid: app.globalData.userInfo._openid,
          daigouName: app.globalData.userInfo.nickName || '代购者',
          status: 'intention',
          statusText: '意向订单',
          remark: '',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })

      showToast('接单成功', 'success')
      this.setData({ 'demand.status': 'accepted', 'statusInfo': { name: '已接单', color: '#5AC8FA' } })
    } catch (err) {
      console.error(err)
      showToast('接单失败')
    }
  },

  openChat() {
    if (!app.globalData.isLoggedIn) { wx.showModal({ title: '提示', content: '请先登录', confirmColor: '#E8734A' }); return }
    wx.navigateTo({
      url: `/pages/chat/chat?targetOpenid=${this.data.demand._openid}&targetName=${this.data.demand.userInfo.nickName || '用户'}`
    })
  }
})