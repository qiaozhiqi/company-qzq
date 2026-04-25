<template>
  <view class="order-confirm-container">
    <view class="route-section">
      <view class="route-info">
        <view class="route-item">
          <view class="dot blue-dot"></view>
          <view class="route-text">
            <view class="route-title">{{ startLocation?.name || '起点' }}</view>
            <view class="route-detail">{{ startLocation?.address }}</view>
          </view>
        </view>
        <view class="route-line"></view>
        <view class="route-item">
          <view class="dot green-dot"></view>
          <view class="route-text">
            <view class="route-title">{{ endLocation?.name || '终点' }}</view>
            <view class="route-detail">{{ endLocation?.address }}</view>
          </view>
        </view>
      </view>
      
      <view class="route-stats">
        <view class="stat-item">
          <text class="stat-value">{{ distance }}公里</text>
          <text class="stat-label">预估距离</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ duration }}分钟</text>
          <text class="stat-label">预计用时</text>
        </view>
      </view>
    </view>
    
    <view class="car-section">
      <view class="section-header">
        <text class="section-title">已选车型</text>
        <text class="section-action" @click="changeCarType">更换车型</text>
      </view>
      
      <view class="selected-car">
        <view class="car-icon">
          <u-icon name="car-fill" size="48" color="#1890FF"></u-icon>
        </view>
        <view class="car-info">
          <view class="car-name">{{ selectedCarTypeInfo?.name }}</view>
          <view class="car-desc">可乘4人 · 含基础服务</view>
        </view>
        <view class="car-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ estimatedPrice }}</text>
          <text class="price-tip">预估</text>
        </view>
      </view>
    </view>
    
    <view class="passenger-section">
      <view class="section-header">
        <text class="section-title">乘车人信息</text>
      </view>
      
      <view class="passenger-item">
        <view class="passenger-label">姓名</view>
        <u-input 
          v-model="passengerForm.name" 
          placeholder="请输入乘车人姓名" 
          :border="false"
        />
      </view>
      
      <view class="passenger-item">
        <view class="passenger-label">手机号</view>
        <u-input 
          v-model="passengerForm.phone" 
          placeholder="请输入手机号" 
          :border="false"
          type="number"
          :maxlength="11"
        />
      </view>
    </view>
    
    <view class="remark-section">
      <view class="section-header">
        <text class="section-title">备注信息</text>
        <text class="section-optional">选填</text>
      </view>
      
      <textarea 
        v-model="remark" 
        placeholder="请输入备注信息，如：需要后备箱、携带宠物等"
        class="remark-textarea"
        :maxlength="100"
      ></textarea>
      
      <view class="remark-count">{{ remark.length }}/100</view>
    </view>
    
    <view class="tip-section">
      <view class="tip-item">
        <u-icon name="info-circle" size="32" color="#1890FF"></u-icon>
        <text class="tip-text">企业对公支付，无需个人垫付</text>
      </view>
      <view class="tip-item">
        <u-icon name="info-circle" size="32" color="#1890FF"></u-icon>
        <text class="tip-text">订单将自动归集到企业账单</text>
      </view>
    </view>
    
    <view class="bottom-actions">
      <view class="price-section">
        <view class="price-label">预估费用</view>
        <view class="price-value">
          <text class="symbol">¥</text>
          <text class="amount">{{ estimatedPrice }}</text>
          <text class="range">~{{ estimatedPrice + 20 }}</text>
        </view>
      </view>
      
      <u-button 
        type="primary"
        :loading="submitting"
        @click="submitOrder"
        shape="circle"
        height="88rpx"
        customStyle="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%); width: 300rpx;"
      >
        {{ submitting ? '下单中...' : '确认叫车' }}
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Location } from '@/types'

const startLocation = ref<Location | null>(null)
const endLocation = ref<Location | null>(null)
const selectedCarType = ref<string>('comfort')
const estimatedPrice = ref<number>(45)
const distance = ref<number>(12.5)
const duration = ref<number>(25)
const remark = ref<string>('')
const submitting = ref<boolean>(false)

const passengerForm = ref({
  name: '张三',
  phone: '13800138000'
})

const carTypes = ref([
  { type: 'economy', name: '经济型', price: 15 },
  { type: 'comfort', name: '舒适型', price: 25 },
  { type: 'business', name: '商务型', price: 45 },
  { type: 'luxury', name: '豪华型', price: 80 }
])

const selectedCarTypeInfo = computed(() => {
  return carTypes.value.find(c => c.type === selectedCarType.value)
})

const changeCarType = () => {
  uni.showToast({
    title: '请返回首页选择车型',
    icon: 'none'
  })
}

const submitOrder = async () => {
  if (!passengerForm.value.name.trim()) {
    uni.showToast({
      title: '请输入乘车人姓名',
      icon: 'none'
    })
    return
  }
  
  if (!passengerForm.value.phone.trim() || passengerForm.value.phone.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  submitting.value = true
  
  setTimeout(() => {
    submitting.value = false
    
    uni.showToast({
      title: '下单成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/taxi/trip-detail?id=taxi_002'
      })
    }, 1000)
  }, 1500)
}

onMounted(() => {
})
</script>

<style lang="scss" scoped>
.order-confirm-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 180rpx;
}

.route-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.route-info {
  padding: 16rpx 0;
}

.route-item {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
}

.dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-top: 8rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.blue-dot {
  background: #1890FF;
}

.green-dot {
  background: #52C41A;
}

.route-text {
  flex: 1;
}

.route-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.route-detail {
  font-size: 26rpx;
  color: #999999;
}

.route-line {
  width: 2rpx;
  height: 48rpx;
  background: #E8E8E8;
  margin-left: 9rpx;
}

.route-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #F5F5F5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #1890FF;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #F5F5F5;
  align-self: center;
}

.car-section,
.passenger-section,
.remark-section {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

.section-action {
  font-size: 26rpx;
  color: #1890FF;
}

.section-optional {
  font-size: 24rpx;
  color: #999999;
}

.selected-car {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #E6F7FF;
  border-radius: 16rpx;
  border: 2rpx solid #1890FF;
}

.car-icon {
  width: 80rpx;
  height: 80rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-info {
  flex: 1;
  margin-left: 24rpx;
}

.car-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.car-desc {
  font-size: 24rpx;
  color: #999999;
}

.car-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price-symbol {
  font-size: 24rpx;
  color: #1890FF;
}

.price-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #1890FF;
}

.price-tip {
  font-size: 22rpx;
  color: #999999;
}

.passenger-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.passenger-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
}

.remark-textarea {
  width: 100%;
  height: 160rpx;
  padding: 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
}

.remark-count {
  text-align: right;
  font-size: 24rpx;
  color: #999999;
  margin-top: 12rpx;
}

.tip-section {
  background: #FFFBE6;
  padding: 24rpx 32rpx;
  margin: 20rpx 32rpx;
  border-radius: 16rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
}

.tip-text {
  font-size: 26rpx;
  color: #D48806;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.price-section {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.price-value {
  display: flex;
  align-items: baseline;
}

.symbol {
  font-size: 28rpx;
  color: #FF4D4F;
}

.amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.range {
  font-size: 26rpx;
  color: #999999;
  margin-left: 8rpx;
}
</style>
