<template>
  <view class="about-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <u-icon name="arrow-left" size="36" color="#333333"></u-icon>
      </view>
      <view class="header-title">关于我们</view>
      <view class="header-right"></view>
    </view>
    
    <view class="content">
      <view class="logo-section">
        <view class="logo">
          <u-icon name="company" size="120" color="#1890FF"></u-icon>
        </view>
        <view class="company-name">企业商旅服务平台</view>
        <view class="version">版本 v1.0.0</view>
      </view>
      
      <view class="info-section">
        <view class="info-item" @click="showAgreement">
          <text class="info-text">服务协议</text>
          <u-icon name="arrow-right" size="28" color="#999999"></u-icon>
        </view>
        <view class="info-item" @click="showPrivacy">
          <text class="info-text">隐私政策</text>
          <u-icon name="arrow-right" size="28" color="#999999"></u-icon>
        </view>
        <view class="info-item" @click="checkUpdate">
          <text class="info-text">检查更新</text>
          <u-icon name="arrow-right" size="28" color="#999999"></u-icon>
        </view>
      </view>
      
      <view class="description">
        <text class="desc-text">企业商旅服务平台致力于为企业提供便捷、高效的差旅管理解决方案，帮助企业降低差旅成本，提升出行体验。</text>
      </view>
      
      <view class="contact-info">
        <view class="contact-item">
          <u-icon name="phone" size="24" color="#666666"></u-icon>
          <text class="contact-text">客服热线：400-123-4567</text>
        </view>
        <view class="contact-item">
          <u-icon name="mail" size="24" color="#666666"></u-icon>
          <text class="contact-text">邮箱：service@example.com</text>
        </view>
        <view class="contact-item">
          <u-icon name="location" size="24" color="#666666"></u-icon>
          <text class="contact-text">地址：北京市朝阳区建国路88号</text>
        </view>
      </view>
      
      <view class="copyright">
        <text class="copyright-text">© 2026 企业商旅服务平台 版权所有</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goBack = () => {
  uni.navigateBack()
}

const showAgreement = () => {
  uni.showModal({
    title: '服务协议',
    content: '服务协议内容...',
    showCancel: false
  })
}

const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '隐私政策内容...',
    showCancel: false
  })
}

const checkUpdate = () => {
  uni.showToast({
    title: '当前已是最新版本',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background: #F5F5F5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: #FFFFFF;
  border-bottom: 2rpx solid #F5F5F5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left,
.header-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
  text-align: center;
}

.content {
  padding: 48rpx 32rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  background: #E6F7FF;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.company-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.version {
  font-size: 24rpx;
  color: #999999;
}

.info-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-text {
  font-size: 28rpx;
  color: #333333;
}

.description {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.desc-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 40rpx;
  text-align: center;
}

.contact-info {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.contact-text {
  font-size: 26rpx;
  color: #666666;
  margin-left: 16rpx;
  flex: 1;
}

.copyright {
  text-align: center;
  padding: 24rpx 0;
}

.copyright-text {
  font-size: 22rpx;
  color: #999999;
}
</style>