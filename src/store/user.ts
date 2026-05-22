import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, LoginResult } from '@/types'
import { mockUser } from '@/mock'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  const init = () => {
    const savedToken = uni.getStorageSync('token')
    const savedUserInfo = uni.getStorageSync('userInfo')
    
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo)
      } catch (e) {
        userInfo.value = null
      }
    }
  }

  const checkLoginStatus = async (): Promise<boolean> => {
    init()
    return isLoggedIn.value
  }

  const login = async (params: LoginParams): Promise<LoginResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (params.companyCode && params.username && params.password) {
          const mockToken = 'mock_token_' + Date.now()
          const result: LoginResult = {
            token: mockToken,
            user: mockUser
          }
          
          token.value = mockToken
          userInfo.value = mockUser
          
          uni.setStorageSync('token', mockToken)
          uni.setStorageSync('userInfo', JSON.stringify(mockUser))
          
          resolve(result)
        } else {
          reject(new Error('请填写完整的登录信息'))
        }
      }, 1000)
    })
  }

  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      token.value = null
      userInfo.value = null
      
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      resolve()
    })
  }

  const updateUserInfo = async (data: Partial<User>): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userInfo.value) {
          userInfo.value = { ...userInfo.value, ...data }
          uni.setStorageSync('userInfo', JSON.stringify(userInfo.value))
        }
        resolve(userInfo.value!)
      }, 500)
    })
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    init,
    checkLoginStatus,
    login,
    logout,
    updateUserInfo
  }
})
