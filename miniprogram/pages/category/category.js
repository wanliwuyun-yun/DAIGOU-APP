const { REGIONS } = require('../../utils/config')
const db = wx.cloud.database()

Page({
  data: {
    regions: REGIONS,
    keyword: '',
    mode: 'region', // region / search
    searched: false,
    searchTab: 'product',
    searchResults: []
  },

  onLoad(options) {
    if (options.mode === 'search') {
      this.setData({ mode: 'search' })
    }
    if (options.groupId) {
      // 滚动到指定分组
      setTimeout(() => {
        wx.createSelectorQuery().select(`#region-${options.groupId}`).boundingClientRect((rect) => {
          if (rect) {
            wx.pageScrollTo({ scrollTop: rect.top - 120, duration: 300 })
          }
        }).exec()
      }, 300)
    }
    this.loadRegionStats()
  },

  // 加载各地区统计数据
  async loadRegionStats() {
    try {
      // 统计每个地区的商品数和代购数
      const { data: products } = await db.collection('products')
        .where({ status: '上架' })
        .field({ region: true })
        .limit(1000)
        .get()

      const regionProductCount = {}
      products.forEach(p => {
        regionProductCount[p.region] = (regionProductCount[p.region] || 0) + 1
      })

      const regions = this.data.regions.map(group => ({
        ...group,
        children: group.children.map(region => ({
          ...region,
          productCount: regionProductCount[region.id] || 0,
          daigouCount: Math.floor(Math.random() * 20) + 1 // 模拟数据
        }))
      }))

      this.setData({ regions })
    } catch (err) {
      console.error('加载地区统计失败：', err)
    }
  },

  // 搜索输入
  onSearch(e) {
    this.setData({ keyword: e.detail.value })
  },

  // 清除搜索
  clearSearch() {
    this.setData({ keyword: '', searched: false, searchResults: [] })
  },

  // 执行搜索
  async doSearch() {
    const { keyword, searchTab } = this.data
    if (!keyword.trim()) return

    this.setData({ mode: 'search', searched: true })
    await this.doSearchByTab(searchTab)
  },

  // 切换搜索标签
  async switchSearchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ searchTab: tab })
    if (this.data.searched) {
      await this.doSearchByTab(tab)
    }
  },

  // 按标签搜索
  async doSearchByTab(tab) {
    const keyword = this.data.keyword.trim()
    if (!keyword) return

    const _ = db.command
    let results = []

    try {
      if (tab === 'product') {
        const { data } = await db.collection('products')
          .where({ status: '上架', name: db.RegExp({ regexp: keyword, options: 'i' }) })
          .limit(20)
          .get()
        results = data
      } else if (tab === 'demand') {
        const { data } = await db.collection('demands')
          .where({ status: 'waiting', productName: db.RegExp({ regexp: keyword, options: 'i' }) })
          .limit(20)
          .get()
        // 补充时间
        const { timeAgo } = require('../../utils/util')
        results = data.map(d => ({ ...d, timeAgo: timeAgo(d.createdAt) }))
      } else if (tab === 'daigou') {
        const { data } = await db.collection('users')
          .where({ 
            role: _.in(['daigou', 'both']),
            applyStatus: 'approved',
            nickName: db.RegExp({ regexp: keyword, options: 'i' })
          })
          .limit(20)
          .get()
        results = data
      }

      this.setData({ searchResults: results })
    } catch (err) {
      console.error('搜索失败：', err)
    }
  },

  // 地区点击 - 跳转商品列表
  onRegionTap(e) {
    const region = e.currentTarget.dataset.region
    const group = e.currentTarget.dataset.group
    wx.navigateTo({
      url: `/pages/product-list/product-list?region=${region.id}&regionName=${region.name}&groupName=${group.name}`
    })
  }
})