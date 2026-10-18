/**
 * 全局配置文件
 * 包含地区分类、商品品类、订单状态等固定数据
 */

// 地区分类 - 完整层级
const REGIONS = [
  {
    id: 'hk_mo_tw',
    name: '港澳台专区',
    icon: '🏠',
    color: '#E8734A',
    children: [
      { id: 'hongkong', name: '中国香港', flag: '🇭🇰' },
      { id: 'macau', name: '中国澳门', flag: '🇲🇴' },
      { id: 'taiwan', name: '中国台湾', flag: '🇹🇼' }
    ]
  },
  {
    id: 'southeast_asia',
    name: '东南亚专区',
    icon: '🌴',
    color: '#34C759',
    children: [
      { id: 'singapore', name: '新加坡', flag: '🇸🇬' },
      { id: 'malaysia', name: '马来西亚', flag: '🇲🇾' },
      { id: 'thailand', name: '泰国', flag: '🇹🇭' },
      { id: 'vietnam', name: '越南', flag: '🇻🇳' },
      { id: 'philippines', name: '菲律宾', flag: '🇵🇭' },
      { id: 'indonesia', name: '印尼', flag: '🇮🇩' },
      { id: 'cambodia', name: '柬埔寨', flag: '🇰🇭' },
      { id: 'laos', name: '老挝', flag: '🇱🇦' }
    ]
  },
  {
    id: 'east_asia',
    name: '日韩专区',
    icon: '🏯',
    color: '#FF6B6B',
    children: [
      { id: 'japan', name: '日本', flag: '🇯🇵' },
      { id: 'korea', name: '韩国', flag: '🇰🇷' }
    ]
  },
  {
    id: 'europe',
    name: '欧洲专区',
    icon: '🏰',
    color: '#5AC8FA',
    children: [
      { id: 'uk', name: '英国', flag: '🇬🇧' },
      { id: 'france', name: '法国', flag: '🇫🇷' },
      { id: 'germany', name: '德国', flag: '🇩🇪' },
      { id: 'italy', name: '意大利', flag: '🇮🇹' },
      { id: 'spain', name: '西班牙', flag: '🇪🇸' },
      { id: 'switzerland', name: '瑞士', flag: '🇨🇭' },
      { id: 'netherlands', name: '荷兰', flag: '🇳🇱' },
      { id: 'greece', name: '希腊', flag: '🇬🇷' },
      { id: 'portugal', name: '葡萄牙', flag: '🇵🇹' },
      { id: 'other_europe', name: '其他欧洲国家', flag: '🌍' }
    ]
  },
  {
    id: 'americas',
    name: '美洲专区',
    icon: '🗽',
    color: '#AF52DE',
    children: [
      { id: 'usa', name: '美国', flag: '🇺🇸' },
      { id: 'canada', name: '加拿大', flag: '🇨🇦' },
      { id: 'brazil', name: '巴西', flag: '🇧🇷' },
      { id: 'mexico', name: '墨西哥', flag: '🇲🇽' },
      { id: 'argentina', name: '阿根廷', flag: '🇦🇷' },
      { id: 'other_americas', name: '其他美洲国家', flag: '🌍' }
    ]
  },
  {
    id: 'oceania',
    name: '澳洲专区',
    icon: '🦘',
    color: '#FF9500',
    children: [
      { id: 'australia', name: '澳大利亚', flag: '🇦🇺' },
      { id: 'newzealand', name: '新西兰', flag: '🇳🇿' }
    ]
  },
  {
    id: 'middle_east',
    name: '中东专区',
    icon: '🕌',
    color: '#C9A96E',
    children: [
      { id: 'uae', name: '阿联酋', flag: '🇦🇪' },
      { id: 'saudi', name: '沙特阿拉伯', flag: '🇸🇦' },
      { id: 'qatar', name: '卡塔尔', flag: '🇶🇦' },
      { id: 'turkey', name: '土耳其', flag: '🇹🇷' },
      { id: 'other_middle_east', name: '其他中东国家', flag: '🌍' }
    ]
  },
  {
    id: 'other',
    name: '全球其他地区',
    icon: '🌐',
    color: '#8E8E93',
    children: [
      { id: 'india', name: '印度', flag: '🇮🇳' },
      { id: 'russia', name: '俄罗斯', flag: '🇷🇺' },
      { id: 'south_africa', name: '南非', flag: '🇿🇦' },
      { id: 'other_global', name: '其他地区', flag: '🌍' }
    ]
  }
]

// 商品品类
const CATEGORIES = [
  { id: 'beauty', name: '美妆护肤', icon: '💄' },
  { id: 'luxury', name: '奢侈品', icon: '👜' },
  { id: 'health', name: '保健品', icon: '💊' },
  { id: 'baby', name: '母婴用品', icon: '🍼' },
  { id: 'snacks', name: '零食食品', icon: '🍰' },
  { id: 'digital', name: '数码电子', icon: '📱' },
  { id: 'fashion', name: '潮牌服饰', icon: '👔' },
  { id: 'medicine', name: '药品', icon: '🏥' },
  { id: 'creative', name: '文创周边', icon: '🎨' },
  { id: 'home', name: '家居日用', icon: '🏠' },
  { id: 'sports', name: '运动户外', icon: '⚽' },
  { id: 'other', name: '其他', icon: '📦' }
]

// 订单状态
const ORDER_STATUS = {
  INTENTION: { key: 'intention', name: '意向订单', color: '#8E8E93', desc: '等待确认' },
  PENDING: { key: 'pending', name: '待确认', color: '#FF9500', desc: '代购者确认中' },
  PURCHASING: { key: 'purchasing', name: '代购中', color: '#5AC8FA', desc: '正在采购商品' },
  SHIPPING: { key: 'shipping', name: '运输中', color: '#AF52DE', desc: '商品运输中' },
  ARRIVED: { key: 'arrived', name: '已到货', color: '#34C759', desc: '商品已到达' },
  COMPLETED: { key: 'completed', name: '已完成', color: '#34C759', desc: '交易完成' },
  CANCELLED: { key: 'cancelled', name: '已取消', color: '#FF3B30', desc: '订单已取消' }
}

// 需求状态
const DEMAND_STATUS = {
  WAITING: { key: 'waiting', name: '待接单', color: '#FF9500' },
  ACCEPTED: { key: 'accepted', name: '已接单', color: '#5AC8FA' },
  COMPLETED: { key: 'completed', name: '已完成', color: '#34C759' },
  CANCELLED: { key: 'cancelled', name: '已取消', color: '#FF3B30' }
}

// 代购申请状态
const APPLY_STATUS = {
  PENDING: { key: 'pending', name: '审核中', color: '#FF9500' },
  APPROVED: { key: 'approved', name: '已通过', color: '#34C759' },
  REJECTED: { key: 'rejected', name: '已拒绝', color: '#FF3B30' }
}

// 轮播图配置
const BANNERS = [
  {
    id: 1,
    title: '全球好物 一键代购',
    desc: '覆盖港澳台、东南亚、日韩、欧美等全球地区',
    color: '#E8734A',
    image: ''
  },
  {
    id: 2,
    title: '成为代购达人',
    desc: '开通代购身份，接单赚取服务费',
    color: '#C9A96E',
    image: ''
  },
  {
    id: 3,
    title: '代购须知',
    desc: '了解税费、运费、退换规则，安心购物',
    color: '#1A1A2E',
    image: ''
  }
]

// 违禁品清单
const PROHIBITED_ITEMS = [
  '易燃易爆物品', '毒品及精神类药品', '枪支弹药及管制刀具',
  '濒危动植物制品', '淫秽色情物品', '伪造货币及证券',
  '放射性物品', '腐蚀性物品', '国家禁止进出境的其他物品'
]

module.exports = {
  REGIONS,
  CATEGORIES,
  ORDER_STATUS,
  DEMAND_STATUS,
  APPLY_STATUS,
  BANNERS,
  PROHIBITED_ITEMS
}