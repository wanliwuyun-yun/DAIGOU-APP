// pages/daigou-list/daigou-list.js
const db = wx.cloud.database()
const _ = db.command

Page({
  data: { currentRegion: 'all', sort: 'default', list: [], loading: false, noMore: false, page: 0, pageSize: 10 },

  onLoad() { this.loadList() },
  onReachBottom() { if (!this.data.noMore && !this.data.loading) this.loadList() },
  onPullDownRefresh() {
    this.setData({ page: 0, noMore: false, list: [] })
    this.loadList().then(() => wx.stopPullDownRefresh()).catch(() => wx.stopPullDownRefresh())
  },

  onRegionChange(e) {
    this.setData({ currentRegion: e.detail.id, page: 0, noMore: false, list: [] })
    this.loadList()
  },

  onSort(e) {
    this.setData({ sort: e.currentTarget.dataset.sort, page: 0, noMore: false, list: [] })
    this.loadList()
  },

  async loadList() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      let where = { role: _.in(['daigou', 'both']), applyStatus: 'approved' }
      if (this.data.currentRegion !== 'all') {
        where['daigouInfo.regions'] = this.data.currentRegion
      }

      let orderBy = 'createdAt'
      let order = 'desc'
      if (this.data.sort === 'orderCount') { orderBy = 'daigouInfo.orderCount'; order = 'desc' }
      if (this.data.sort === 'rating') { orderBy = 'daigouInfo.rating'; order = 'desc' }

      const { data } = await db.collection('users').where(where)
        .orderBy(orderBy, order).skip(this.data.page * this.data.pageSize).limit(this.data.pageSize).get()

      this.setData({
        list: [...this.data.list, ...data],
        page: this.data.page + 1,
        noMore: data.length < this.data.pageSize,
        loading: false
      })
    } catch (err) {
      console.error(err)
      this.setData({ loading: false })
    }
  }
})