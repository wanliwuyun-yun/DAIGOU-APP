Component({
  properties: {
    item: { type: Object, value: {} }
  },
  methods: {
    onTap() {
      const openid = this.data.item._openid
      if (openid) {
        wx.navigateTo({ url: `/pages/daigou-detail/daigou-detail?id=${openid}` })
      }
    }
  }
})