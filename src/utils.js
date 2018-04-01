
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
export {
  store
}