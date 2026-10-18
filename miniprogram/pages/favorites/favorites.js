// js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: { list: [] },
  onShow() { if (app.globalData.isLoggedIn) this.loadList() },
  async loadList() {
    const { data } = await db.collection('favorites').where({ userId: app.globalData.userInfo._openid }).orderBy('createdAt', 'desc').limit(50).get()
    const list = data.map(fav => ({
      _id: fav._id,
      daigouInfo: { _openid: fav.targetOpenid, nickName: fav.targetName, avatarUrl: fav.targetAvatar, verified: true, daigouInfo: { regionNames: ['全球'], orderCount: 0, rating: '5.0', reviewCount: 0, description: '' } }
    }))
    this.setData({ list })
  }
})