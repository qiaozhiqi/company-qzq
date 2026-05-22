<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <view class="app-name">企业商旅</view>
      <view class="app-desc">公务出行 · 企业支付</view>
    </view>
    
    <view class="login-form">
      <view class="form-item">
        <view class="form-label">企业代码</view>
        <u-input 
          v-model="formData.companyCode" 
          placeholder="请输入企业代码" 
          :border="false"
          clearable
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">账号</view>
        <u-input 
          v-model="formData.username" 
          placeholder="请输入员工账号" 
          :border="false"
          clearable
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">密码</view>
        <u-input 
          v-model="formData.password" 
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="请输入登录密码" 
          :border="false"
          :password="!passwordVisible"
          :suffixIcon="passwordVisible ? 'eye' : 'eye-off'"
          @click="togglePasswordVisible"
        />
      </view>
      
      <view class="form-tip">
        <text class="tip-text">提示：企业代码、账号、密码由公司统一分配</text>
      </view>
      
      <u-button 
        type="primary" 
        :loading="loading"
        :disabled="!canSubmit"
        @click="handleLogin"
        shape="circle"
        height="96rpx"
        customStyle="margin-top: 48rpx; background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);"
      >
        {{ loading ? '登录中...' : '登录' }}
      </u-button>
    </view>
    
    <view class="login-footer">
      <text class="footer-text">© 2024 企业商旅服务平台</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import type { LoginParams } from '@/types'

const userStore = useUserStore()

const formData = ref<LoginParams>({
  companyCode: '',
  username: '',
  password: ''
})

const passwordVisible = ref(false)
const loading = ref(false)

const canSubmit = computed(() => {
  return formData.value.companyCode.trim() !== '' && 
         formData.value.username.trim() !== '' && 
         formData.value.password.trim() !== ''
})

const togglePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
}

const handleLogin = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请填写完整的登录信息',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  
  try {
    await userStore.login(formData.value)
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/taxi/index'
      })
    }, 1000)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #E6F7FF 0%, #FFFFFF 100%);
  display: flex;
  flex-direction: column;
  padding: 0 48rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  padding-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(24, 144, 255, 0.2);
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #1890FF;
  margin-top: 32rpx;
}

.app-desc {
  font-size: 28rpx;
  color: #999999;
  margin-top: 16rpx;
}

.login-form {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 2rpx solid #F0F0F0;
  
  &:last-of-type {
    border-bottom: none;
  }
}

.form-label {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.form-tip {
  margin-top: 32rpx;
  padding: 20rpx 24rpx;
  background: #FFFBE6;
  border-radius: 12rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #FAAD14;
  line-height: 1.6;
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48rpx 0;
  margin-top: auto;
}

.footer-text {
  font-size: 24rpx;
  color: #CCCCCC;
}
</style>
