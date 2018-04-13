
const store = {
  get(key){
    return window.localStorage.getItem(key)
  },
  set(key, data){
    return window.localStorage.setItem(key, data)
  },
  remove(key){
    return window.localStorage.removeItem(key)
  }
}
const language = {
  planForm: {
    cn: '排期表单',
    en: 'Plan Form'
  },
  Instructions: {
    cn: '说明',
    en: 'instructions'
  },
  planTable: {
    cn: '排期表格',
    en: 'Plan Table'
  },
  planChart: {
    cn: '排期分析',
    en: 'Plan Chart'
  },
  title: {
    cn: '标题',
    en: 'title',
  },
  content: {
    cn: '内容',
    en: 'content',
  },
  members: {
    cn: '成员',
    en: 'members',
  },
  unit: {
    cn: '单位'
  },
  noSaturday:{
    cn: '过滤周六',
    en: 'no Saturday'
  },
  noSunday:{
    cn: '过滤周日',
    en: 'no Sunday'
  },
  startAt : {
    cn: '开始于',
    en: 'start at'
  },
  copyTable: {
    cn: '复制表格',
    en: 'caopy table'
  },
  save: {
    cn: '保存',
    en: 'save',
  },
  allMembers: {
    cn: '所有成员',
    en: 'members array'
  },

}
export {
  store,
  language
}