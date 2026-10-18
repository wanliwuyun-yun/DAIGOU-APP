const { getDemandStatusInfo, timeAgo } = require('../../utils/util')
Component({
  properties: {
    item: { type: Object, value: {} }
  },
  observers: {
    'item.status': function (status) {
      this.setData({ statusInfo: getDemandStatusInfo(status) })
    },
    'item.createdAt': function (createdAt) {
      this.setData({ timeAgo: timeAgo(createdAt) })
    }
  },
  data: {
    statusInfo: { name: '待接单', color: '#FF9500' },
    timeAgo: ''
  },
  methods: {
    onTap() {
      const id = this.data.item._id
      if (id) {
        wx.navigateTo({ url: `/pages/demand-detail/demand-detail?id=${id}` })
      }
    }
  }
})