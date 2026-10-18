const app = getApp()
const { formatTime, chooseAndUploadImage, showToast } = require('../../utils/util')
const db = wx.cloud.database()
const _ = db.command

let chatId = ''
let targetOpenid = ''
let timer = null

Page({
  data: {
    targetName: '',
    targetAvatar: '/images/avatar-default.png',
    myAvatar: '/images/avatar-default.png',
    messages: [],
    inputText: '',
    scrollToId: ''
  },

  onLoad(options) {
    targetOpenid = options.targetOpenid
    chatId = options.chatId || ''
    this.setData({
      targetName: options.targetName || '用户',
      targetAvatar: options.targetAvatar || '/images/avatar-default.png',
      myAvatar: (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) || '/images/avatar-default.png'
    })
    wx.setNavigationBarTitle({ title: options.targetName || '聊天' })
    this.initChat()
    this.loadMessages()
    // 定时刷新消息
    timer = setInterval(() => this.loadMessages(), 3000)
  },

  onUnload() {
    if (timer) clearInterval(timer)
  },

  async initChat() {
    if (chatId) return
    try {
      const myOpenid = app.globalData.userInfo._openid
      const { data } = await db.collection('chats').where(
        _.or([
          { userA: myOpenid, userB: targetOpenid },
          { userA: targetOpenid, userB: myOpenid }
        ])
      ).limit(1).get()

      if (data.length > 0) {
        chatId = data[0]._id
      } else {
        // 获取对方信息
        const { data: targetUser } = await db.collection('users').where({ _openid: targetOpenid }).limit(1).get()
        const targetName = targetUser.length > 0 ? targetUser[0].nickName : '用户'
        const targetAvatar = targetUser.length > 0 ? (targetUser[0].avatarUrl || '') : ''
        const myName = app.globalData.userInfo.nickName || '用户'
        const myAvatar = app.globalData.userInfo.avatarUrl || ''

        const res = await db.collection('chats').add({
          data: {
            userA: myOpenid, userAName: myName, userAAvatar: myAvatar,
            userB: targetOpenid, userBName: targetName, userBAvatar: targetAvatar,
            lastMessage: '',
            unreadCountA: 0,
            unreadCountB: 0,
            updatedAt: db.serverDate()
          }
        })
        chatId = res._id
      }
    } catch (err) {
      console.error('初始化聊天失败：', err)
    }
  },

  async loadMessages() {
    if (!chatId) return
    try {
      const myOpenid = app.globalData.userInfo._openid
      const { data } = await db.collection('messages')
        .where({ chatId })
        .orderBy('createdAt', 'asc')
        .limit(100)
        .get()

      const messages = data.map(msg => ({
        ...msg,
        isMe: msg.from === myOpenid,
        timeStr: formatTime(msg.createdAt)
      }))

      this.setData({ messages, scrollToId: 'msg-bottom' })
    } catch (err) {
      console.error('加载消息失败：', err)
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  async sendTextMsg() {
    const content = this.data.inputText.trim()
    if (!content) return

    this.setData({ inputText: '' })
    await this.sendMessage('text', content)
  },

  async chooseImage() {
    try {
      const urls = await chooseAndUploadImage(1)
      if (urls.length > 0) {
        await this.sendMessage('image', urls[0])
      }
    } catch (err) {}
  },

  async sendMessage(type, content) {
    if (!chatId) await this.initChat()
    if (!chatId) { showToast('发送失败'); return }

    try {
      const myOpenid = app.globalData.userInfo._openid
      await db.collection('messages').add({
        data: {
          chatId,
          from: myOpenid,
          type,
          content,
          createdAt: db.serverDate()
        }
      })

      // 更新会话
      const myOpenid2 = app.globalData.userInfo._openid
      const chatData = await db.collection('chats').doc(chatId).get()
      const chat = chatData.data
      const isMeA = chat.userA === myOpenid2
      await db.collection('chats').doc(chatId).update({
        data: {
          lastMessage: type === 'text' ? content : '[图片]',
          unreadCountB: isMeA ? _.inc(1) : chat.unreadCountB,
          unreadCountA: isMeA ? chat.unreadCountA : _.inc(1),
          updatedAt: db.serverDate()
        }
      })

      this.loadMessages()
    } catch (err) {
      console.error('发送失败：', err)
      showToast('发送失败')
    }
  },

  previewImage(e) {
    wx.previewImage({ urls: [e.currentTarget.dataset.src] })
  }
})