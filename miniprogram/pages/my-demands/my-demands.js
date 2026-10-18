// js
const app = getApp()
const { timeAgo, getRegionName, getCategoryName, getDemandStatusInfo } = require('../../utils/util')
const db = wx.cloud.database()
Page({
  data: { tab: 'all', list: [] },
  onShow() { this.loadList() },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); this.loadList() },
  async loadList() {
    const where = { _openid: app.globalData.userInfo._openid }
    if (this.data.tab !== 'all') where.status = this.data.tab
    const { data } = await db.collection('demands').where(where).orderBy('createdAt', 'desc').limit(50).get()
    const list = data.map(d => ({
      ...d,
      regionName: getRegionName(d.region),
      categoryName: getCategoryName(d.category),
      userInfo: { nickName: app.globalData.userInfo.nickName, avatarUrl: app.globalData.userInfo.avatarUrl },
      timeAgo: timeAgo(d.createdAt)
    }))
    this.setData({ list })
  }
})