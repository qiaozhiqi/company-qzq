<template>
  <view class="payment-container">
    <view class="header-section">
      <view class="header-icon">
        <u-icon name="payment" size="64" color="#1890FF"></u-icon>
      </view>
      <text class="header-title">企业对公支付</text>
      <text class="header-subtitle">请使用企业账户完成支付</text>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">订单信息</text>
      </view>
      
      <view class="order-info" v-if="order">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">酒店名称</text>
          <text class="info-value">{{ order.hotel?.name || '' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">房型</text>
          <text class="info-value">{{ order.roomType?.name || '' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">入住日期</text>
          <text class="info-value">{{ order.checkInDate }} 至 {{ order.checkOutDate }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">入住人</text>
          <text class="info-value">{{ order.guestName }}</text>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="payment-amount-section">
      <view class="section-header">
        <text class="section-title">支付金额</text>
      </view>
      
      <view class="amount-container">
        <text class="amount-symbol">¥</text>
        <text class="amount-value">{{ order?.actualPrice || 0 }}</text>
        <text class="amount-unit">元</text>
      </view>
      
      <view class="amount-tip">
        <u-icon name="info-circle" size="24" color="#1890FF"></u-icon>
        <text class="tip-text">请确保支付金额与订单金额一致</text>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="company-account-section">
      <view class="section-header">
        <text class="section-title">企业收款账户</text>
      </view>
      
      <view class="account-info">
        <view class="account-item">
          <text class="account-label">账户名称</text>
          <text class="account-value">{{ companyInfo?.companyName || '某某科技有限公司' }}</text>
          <u-icon name="copy" size="32" color="#1890FF" @click="copyText(companyInfo?.companyName || '某某科技有限公司')"></u-icon>
        </view>
        <view class="account-item">
          <text class="account-label">银行名称</text>
          <text class="account-value">{{ companyInfo?.bankName || '中国工商银行' }}</text>
          <u-icon name="copy" size="32" color="#1890FF" @click="copyText(companyInfo?.bankName || '中国工商银行')"></u-icon>
        </view>
        <view class="account-item">
          <text class="account-label">银行账号</text>
          <text class="account-value">{{ companyInfo?.bankAccount || '6222021234567890123' }}</text>
          <u-icon name="copy" size="32" color="#1890FF" @click="copyText(companyInfo?.bankAccount || '6222021234567890123')"></u-icon>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="payment-steps-section">
      <view class="section-header">
        <text class="section-title">支付流程</text>
      </view>
      
      <view class="steps-list">
        <view class="step-item">
          <view class="step-number">1</view>
          <view class="step-content">
            <text class="step-title">确认订单信息</text>
            <text class="step-desc">核对订单详情和支付金额</text>
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">2</view>
          <view class="step-content">
            <text class="step-title">企业账户转账</text>
            <text class="step-desc">使用企业对公账户向收款账户转账</text>
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">3</view>
          <view class="step-content">
            <text class="step-title">确认支付</text>
            <text class="step-desc">点击下方按钮确认已完成支付</text>
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">4</view>
          <view class="step-content">
            <text class="step-title">订单完成</text>
            <text class="step-desc">支付成功后订单自动确认</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="bottom-placeholder"></view>
    
    <view class="bottom-bar">
      <u-button 
        type="primary"
        :loading="confirming"
        @click="confirmPayment"
        shape="circle"
        height="88rpx"
        customStyle="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%); width: 100%;"
      >
        {{ confirming ? '确认中...' : '确认支付' }}
      </u-button>
    </view>
    
    <view class="loading-mask" v-if="loading">
      <u-loading-icon size="48" color="#1890FF"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { HotelOrder } from '@/types'
import { hotelApi, companyApi } from '@/api'

const orderId = ref<string>('')
const order = ref<HotelOrder | null>(null)
const companyInfo = ref<any>(null)
const loading = ref(false)
const confirming = ref(false)

const loadOrderDetail = async () => {
  loading.value = true
  
  try {
    const res = await hotelApi.getOrderDetail(orderId.value)
    
    if (res.data) {
      order.value = res.data
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const loadCompanyInfo = async () => {
  try {
    const res = await companyApi.getInvoiceInfo()
    companyInfo.value = res.data
  } catch (error) {
    console.error('加载企业信息失败:', error)
  }
}

const copyText = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      })
    }
  })
}

const confirmPayment = async () => {
  confirming.value = true
  
  try {
    const res = await hotelApi.confirmPayment(orderId.value)
    
    if (res.code === 200) {
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/hotel/order-detail?id=${orderId.value}`
        })
      }, 1500)
    } else {
      uni.showToast({
        title: res.message || '支付失败',
        icon: 'none'
      })
      confirming.value = false
    }
  } catch (error: any) {
    confirming.value = false
    console.error('确认支付失败:', error)
    uni.showToast({
      title: error.message || '确认失败，请重试',
      icon: 'none'
    })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  
  orderId.value = options.id || ''
  
  if (!orderId.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  loadOrderDetail()
  loadCompanyInfo()
})
</script>

<style lang="scss" scoped>
.payment-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 180rpx;
  position: relative;
}

.header-section {
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.section-divider {
  height: 20rpx;
  background: #F5F5F5;
}

.order-section,
.payment-amount-section,
.company-account-section,
.payment-steps-section {
  background: #FFFFFF;
  padding: 32rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: #666666;
  flex-shrink: 0;
  width: 160rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333333;
  flex: 1;
  text-align: right;
}

.amount-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin: 40rpx 0;
}

.amount-symbol {
  font-size: 32rpx;
  color: #FF4D4F;
  margin-right: 8rpx;
}

.amount-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.amount-unit {
  font-size: 32rpx;
  color: #666666;
  margin-left: 8rpx;
}

.amount-tip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #FFFBE6;
  padding: 20rpx;
  border-radius: 12rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #D48806;
  flex: 1;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background: #FAFAFA;
  padding: 24rpx;
  border-radius: 16rpx;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.account-label {
  font-size: 26rpx;
  color: #666666;
  flex-shrink: 0;
  width: 160rpx;
}

.account-value {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
  word-break: break-all;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.step-number {
  width: 56rpx;
  height: 56rpx;
  background: #E6F7FF;
  border: 2rpx solid #1890FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #1890FF;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.step-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
}

.bottom-placeholder {
  height: 120rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
  margin-top: 24rpx;
}
</style>