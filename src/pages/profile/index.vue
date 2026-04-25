<template>
  <view class="profile-container">
    <view class="user-card">
      <image class="avatar" :src="userInfo?.avatar" mode="aspectFill" />
      <view class="user-info">
        <view class="user-name">{{ userInfo?.name }}</view>
        <view class="user-company">{{ userInfo?.companyName }}</view>
        <view class="user-department">
          {{ userInfo?.department }} · {{ userInfo?.position }}
        </view>
      </view>
      <u-icon name="arrow-right" size="32" color="#CCCCCC"></u-icon>
    </view>
    
    <view class="menu-section">
      <view class="menu-item" @click="goToOrders('taxi')">
        <view class="menu-icon taxi">
          <u-icon name="car" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">我的打车</view>
          <view class="menu-desc">查看公务打车订单</view>
        </view>
        <view class="menu-badge" v-if="taxiOrderCount > 0">{{ taxiOrderCount }}</view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
      
      <view class="menu-item" @click="goToOrders('hotel')">
        <view class="menu-icon hotel">
          <u-icon name="home" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">我的酒店</view>
          <view class="menu-desc">查看酒店预订订单</view>
        </view>
        <view class="menu-badge" v-if="hotelOrderCount > 0">{{ hotelOrderCount }}</view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
    </view>
    
    <view class="menu-section">
      <view class="menu-item" @click="goToAddresses">
        <view class="menu-icon address">
          <u-icon name="map" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">常用地址</view>
          <view class="menu-desc">管理家、公司等常用地址</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
      
      <view class="menu-item" @click="goToInvoice">
        <view class="menu-icon invoice">
          <u-icon name="file-text" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">发票信息</view>
          <view class="menu-desc">管理企业发票抬头</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
      
      <view class="menu-item" @click="goToContact">
        <view class="menu-icon contact">
          <u-icon name="phone" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">紧急联系人</view>
          <view class="menu-desc">设置紧急联系人信息</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
    </view>
    
    <view class="menu-section">
      <view class="menu-item" @click="goToHelp">
        <view class="menu-icon help">
          <u-icon name="question-circle" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">帮助中心</view>
          <view class="menu-desc">常见问题解答</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
      
      <view class="menu-item" @click="goToFeedback">
        <view class="menu-icon feedback">
          <u-icon name="edit" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">意见反馈</view>
          <view class="menu-desc">提交您的宝贵意见</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
      
      <view class="menu-item" @click="goToAbout">
        <view class="menu-icon about">
          <u-icon name="info-circle" size="40" color="#FFFFFF"></u-icon>
        </view>
        <view class="menu-content">
          <view class="menu-title">关于我们</view>
          <view class="menu-desc">版本 v1.0.0</view>
        </view>
        <u-icon name="arrow-right" size="28" color="#CCCCCC"></u-icon>
      </view>
    </view>
    
    <view class="logout-section">
      <view class="logout-btn" @click="showLogoutConfirm = true">
        <u-icon name="logout" size="36" color="#FF4D4F"></u-icon>
        <text class="logout-text">退出登录</text>
      </view>
    </view>
    
    <view class="footer-info">
      <text class="footer-text">企业商旅服务平台</text>
      <text class="version-text">v1.0.0</text>
    </view>
    
    <u-modal
      v-model:show="showLogoutConfirm"
      title="退出登录"
      content="确定要退出当前账号吗？"
      :show-cancel-button="true"
      :confirm-text="'退出'"
      :cancel-text="'取消'"
      confirm-color="#FF4D4F"
      @confirm="handleLogout"
    ></u-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import type { User } from '@/types'
import { mockUser, mockOrders } from '@/mock'

const userStore = useUserStore()
const userInfo = ref<User | null>(mockUser)
const showLogoutConfirm = ref(false)

const taxiOrderCount = computed(() => {
  return mockOrders.filter(o => o.type === 'taxi' && ['matching', 'matched', 'driver_arrived', 'on_ride'].includes(o.status)).length
})

const hotelOrderCount = computed(() => {
  return mockOrders.filter(o => o.type === 'hotel' && ['confirmed', 'checked_in'].includes(o.status)).length
})

const goToOrders = (type: 'taxi' | 'hotel') => {
  uni.switchTab({
    url: '/pages/orders/index'
  })
}

const goToAddresses = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goToInvoice = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goToContact = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goToHelp = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goToFeedback = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goToAbout = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const handleLogout = async () => {
  uni.showLoading({ title: '退出中...' })
  
  try {
    await userStore.logout()
    
    uni.hideLoading()
    uni.showToast({
      title: '已退出登录',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }, 1000)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '退出失败',
      icon: 'none'
    })
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    userInfo.value = userStore.userInfo
  }
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 48rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  margin-bottom: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  margin-left: 24rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.user-company {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8rpx;
}

.user-department {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.menu-section {
  background: #FFFFFF;
  margin-bottom: 24rpx;
  padding: 0 32rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  
  &.taxi {
    background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  }
  
  &.hotel {
    background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  }
  
  &.address {
    background: linear-gradient(135deg, #FAAD14 0%, #D48806 100%);
  }
  
  &.invoice {
    background: linear-gradient(135deg, #722ED1 0%, #531DAB 100%);
  }
  
  &.contact {
    background: linear-gradient(135deg, #13C2C2 0%, #08979C 100%);
  }
  
  &.help {
    background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  }
  
  &.feedback {
    background: linear-gradient(135deg, #FA8C16 0%, #D46B08 100%);
  }
  
  &.about {
    background: linear-gradient(135deg, #8C8C8C 0%, #595959 100%);
  }
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: #999999;
}

.menu-badge {
  min-width: 36rpx;
  height: 36rpx;
  background: #FF4D4F;
  color: #FFFFFF;
  font-size: 22rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  margin-right: 16rpx;
}

.logout-section {
  padding: 48rpx 32rpx;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 28rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  border: 2rpx solid #FFE8E6;
}

.logout-text {
  font-size: 30rpx;
  color: #FF4D4F;
  font-weight: 500;
}

.footer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  margin-top: 24rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #CCCCCC;
  margin-bottom: 8rpx;
}

.version-text {
  font-size: 22rpx;
  color: #DDDDDD;
}
</style>
