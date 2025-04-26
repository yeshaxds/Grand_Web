import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
    username: ''
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
    welcomeMessage(state) {
      return state.username ? `你好，${state.username}！` : '请登录'
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
    decrement(state) {
      state.count--
    },
    setUsername(state, username) {
      state.username = username
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    },
    login({ commit }, username) {
      // 模拟API请求
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('setUsername', username)
          resolve()
        }, 500)
      })
    }
  },
  modules: {
  }
}) 