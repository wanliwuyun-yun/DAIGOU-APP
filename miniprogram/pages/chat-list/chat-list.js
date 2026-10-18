const app = getApp()
const { timeAgo } = require('../../utils/util')
const db = wx.cloud.database()

Page({
  data: {
    isLoggedIn: false,
    chatList: []
  },

  onShow() {
    this.setData({ isLoggedIn: app.globalData.isLoggedIn })
    if (app.globalData.isLoggedIn) {
      this.loadChatList()
    }
  },

  async loadChatList() {
    try {
      const _openid = app.globalData.userInfo._openid
      const { data } = await db.collection('chats')
        .where(db.command.or([
          { userA: _openid },
          { userB: _openid }
        ]))
        .orderBy('updatedAt', 'desc')
        .limit(50)
        .get()

      const list = data.map(chat => {
        const isMeA = chat.userA === _openid
        const targetOpenid = isMeA ? chat.userB : chat.userA
        return {
          ...chat,
          targetOpenid,
          targetName: isMeA ? chat.userBName : chat.userAName,
          targetAvatar: isMeA ? chat.userBAvatar : chat.userAAvatar,
          lastTimeAgo: timeAgo(chat.updatedAt)
        }
      })

      this.setData({ chatList: list })
    } catch (err) {
      console.error('加载消息列表失败：', err)
    }
  },

  openChat(e) {
    const chat = e.currentTarget.dataset.chat
    wx.navigateTo({
      url: `/pages/chat/chat?targetOpenid=${chat.targetOpenid}&targetName=${chat.targetName}&chatId=${chat._id}`
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/settings/settings?mode=login' })
  }
})