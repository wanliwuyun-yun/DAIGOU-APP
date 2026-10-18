Component({
  properties: {
    item: { type: Object, value: {} }
  },
  methods: {
    onTap() {
      const id = this.data.item._id
      if (id) {
        wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` })
      }
    }
  }
})