var REGIONS = require('../../utils/config').REGIONS

Component({
  properties: {
    activeId: {
      type: String,
      value: 'all'
    }
  },
  data: {
    regions: REGIONS
  },
  methods: {
    onTap: function(e) {
      var id = e.currentTarget.dataset.id
      this.triggerEvent('change', { id: id })
    }
  }
})