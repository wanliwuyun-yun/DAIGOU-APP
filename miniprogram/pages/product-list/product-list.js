const { CATEGORIES } = require('../../utils/config')
const db = wx.cloud.database()

Page({
  data: {
    currentRegion: 'all',
    currentCategory: 'all',
    regionName: '',
    categoryName: '',
    categories: CATEGORIES,
    sort: 'default',
    products: [],
    productsLeft: [],
    productsRight: [],
    loading: false,
    noMore: false,
    page: 0,
    pageSize: 10
  },

  onLoad(options) {
    if (options.region) {
      this.setData({ currentRegion: options.region, regionName: options.regionName || '' })
    }
    if (options.category) {
      const cat = CATEGORIES.find(c => c.id === options.category)
      this.setData({ currentCategory: options.category, categoryName: cat ? cat.name : '' })
    }
    this.loadProducts()
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) {
      this.loadProducts()
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 0, noMore: false, products: [], productsLeft: [], productsRight: [] })
    this.loadProducts().then(() => wx.stopPullDownRefresh()).catch(() => wx.stopPullDownRefresh())
  },

  // 地区筛选变化
  onRegionChange(e) {
    const id = e.detail.id
    this.setData({ currentRegion: id, page: 0, noMore: false, products: [], productsLeft: [], productsRight: [] })
    this.loadProducts()
  },

  // 清除地区筛选
  clearRegion() {
    this.setData({ currentRegion: 'all', regionName: '', page: 0, noMore: false, products: [], productsLeft: [], productsRight: [] })
    this.loadProducts()
  },

  // 品类筛选变化
  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ currentCategory: id, page: 0, noMore: false, products: [], productsLeft: [], productsRight: [] })
    this.loadProducts()
  },

  // 排序变化
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({ sort, page: 0, noMore: false, products: [], productsLeft: [], productsRight: [] })
    this.loadProducts()
  },

  // 加载商品
  async loadProducts() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { currentRegion, currentCategory, sort, page, pageSize } = this.data
      let where = { status: '上架' }

      if (currentRegion !== 'all') {
        where.region = currentRegion
      }
      if (currentCategory !== 'all') {
        where.category = currentCategory
      }

      let orderBy = 'createdAt'
      let order = 'desc'
      if (sort === 'priceAsc') { orderBy = 'price'; order = 'asc' }
      if (sort === 'priceDesc') { orderBy = 'price'; order = 'desc' }
      if (sort === 'newest') { orderBy = 'createdAt'; order = 'desc' }

      const { data } = await db.collection('products')
        .where(where)
        .orderBy(orderBy, order)
        .skip(page * pageSize)
        .limit(pageSize)
        .get()

      const products = [...this.data.products, ...data]
      const left = products.filter((_, i) => i % 2 === 0)
      const right = products.filter((_, i) => i % 2 === 1)

      this.setData({
        products,
        productsLeft: left,
        productsRight: right,
        page: page + 1,
        noMore: data.length < pageSize,
        loading: false
      })
    } catch (err) {
      console.error('加载商品失败：', err)
      this.setData({ loading: false })
    }
  }
})