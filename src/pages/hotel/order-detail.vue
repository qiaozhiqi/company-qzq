<template>
  <view class="order-detail-container">
    <view class="status-section" :class="orderStatusClass">
      <view class="status-icon">
        <u-icon 
          :name="statusIcon" 
          size="64" 
          :color="statusColor"
        ></u-icon>
      </view>
      <text class="status-text">{{ statusText }}</text>
      <text class="status-desc" v-if="statusDesc">{{ statusDesc }}</text>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="hotel-section" v-if="hotel">
      <view class="section-header">
        <text class="section-title">预订信息</text>
      </view>
      
      <view class="hotel-info-card" @click="goToHotelDetail">
        <image class="hotel-image" :src="hotel.image" mode="aspectFill" />
        <view class="hotel-info">
          <view class="hotel-name">{{ hotel.name }}</view>
          <view class="hotel-tags">
            <text class="tag" v-for="(tag, index) in hotel.tags.slice(0, 2)" :key="index">{{ tag }}</text>
          </view>
          <view class="room-info" v-if="roomType">
            <text class="room-name">{{ roomType.name }}</text>
            <text class="room-spec">{{ roomType.size }} · {{ roomType.bedType }}</text>
          </view>
        </view>
        <u-icon name="arrow-right" size="32" color="#CCCCCC"></u-icon>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="info-section">
      <view class="section-header">
        <text class="section-title">入住详情</text>
      </view>
      
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order?.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">入住日期</text>
          <text class="info-value">{{ order?.checkInDate }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">离店日期</text>
          <text class="info-value">{{ order?.checkOutDate }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">入住天数</text>
          <text class="info-value">{{ order?.nights }}晚</text>
        </view>
        <view class="info-item">
          <text class="info-label">入住人</text>
          <text class="info-value">{{ order?.guestName }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ order?.guestPhone }}</text>
        </view>
        <view class="info-item" v-if="order?.checkInTime">
          <text class="info-label">实际入住</text>
          <text class="info-value">{{ order.checkInTime }}</text>
        </view>
        <view class="info-item" v-if="order?.checkOutTime">
          <text class="info-label">实际离店</text>
          <text class="info-value">{{ order.checkOutTime }}</text>
        </view>
        <view class="info-item" v-if="order?.cancelReason">
          <text class="info-label">取消原因</text>
          <text class="info-value">{{ order.cancelReason }}</text>
        </view>
        <view class="info-item" v-if="order?.cancelTime">
          <text class="info-label">取消时间</text>
          <text class="info-value">{{ order.cancelTime }}</text>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="price-section">
      <view class="section-header">
        <text class="section-title">费用明细</text>
      </view>
      
      <view class="price-detail">
        <view class="price-row">
          <text class="price-label">房费</text>
          <text class="price-value">¥{{ order?.totalPrice }}</text>
        </view>
        <view class="price-row total">
          <text class="price-label">合计</text>
          <view class="price-total">
            <text class="symbol">¥</text>
            <text class="amount">{{ order?.actualPrice }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="policy-section">
      <view class="section-header">
        <text class="section-title">预订须知</text>
      </view>
      
      <view class="policy-list">
        <view class="policy-item">
          <u-icon name="info-circle" size="28" color="#1890FF"></u-icon>
          <text class="policy-text">入住时间：通常为14:00以后，提前入住可能需要等候</text>
        </view>
        <view class="policy-item">
          <u-icon name="info-circle" size="28" color="#1890FF"></u-icon>
          <text class="policy-text">离店时间：通常为12:00以前，延迟离店可能产生额外费用</text>
        </view>
        <view class="policy-item" v-if="roomType?.cancelPolicy">
          <u-icon name="info-circle" size="28" color="#1890FF"></u-icon>
          <text class="policy-text">取消政策：{{ roomType.cancelPolicy }}</text>
        </view>
      </view>
    </view>
    
    <view class="bottom-placeholder"></view>
    
    <view class="bottom-bar" v-if="showActionButtons">
      <view class="action-buttons">
        <u-button 
          v-if="canCancel"
          type="default"
          @click="showCancelSheet = true"
          shape="circle"
          height="88rpx"
          customStyle="width: 220rpx; border-color: #1890FF; color: #1890FF;"
        >
          取消订单
        </u-button>
        <u-button 
          v-if="canContact"
          type="primary"
          @click="contactService"
          shape="circle"
          height="88rpx"
          customStyle="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%); width: 220rpx;"
        >
          联系客服
        </u-button>
      </view>
    </view>
    
    <u-action-sheet 
      :show="showCancelSheet" 
      :actions="cancelReasons" 
      :cancel-text="'取消'"
      @click="onCancelReasonSelect"
      @close="showCancelSheet = false"
    ></u-action-sheet>
    
    <view class="loading-mask" v-if="loading">
      <u-loading-icon size="48" color="#1890FF"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Hotel, RoomType, HotelOrder } from '@/types'
import { hotelApi } from '@/api'
import { getHotelOrderStatusText } from '@/mock'

const orderId = ref<string>('')
const order = ref<HotelOrder | null>(null)
const hotel = ref<Hotel | null>(null)
const roomType = ref<RoomType | null>(null)
const loading = ref(false)
const showCancelSheet = ref(false)

const cancelReasons = ref([
  { text: '行程变更', value: '行程变更' },
  { text: '找到更优惠的价格', value: '找到更优惠的价格' },
  { text: '预订信息有误', value: '预订信息有误' },
  { text: '其他原因', value: '其他原因' }
])

const statusText = computed(() => {
  if (!order.value) return ''
  return getHotelOrderStatusText(order.value.status)
})

const statusIcon = computed(() => {
  if (!order.value) return 'info-circle'
  switch (order.value.status) {
    case 'confirmed':
      return 'checkmark-circle'
    case 'completed':
      return 'checkmark-circle'
    case 'cancelled':
      return 'close-circle'
    case 'checked_in':
      return 'checkmark-circle'
    default:
      return 'info-circle'
  }
})

const statusColor = computed(() => {
  if (!order.value) return '#999999'
  switch (order.value.status) {
    case 'confirmed':
      return '#1890FF'
    case 'completed':
      return '#52C41A'
    case 'cancelled':
      return '#999999'
    case 'checked_in':
      return '#FAAD14'
    default:
      return '#999999'
  }
})

const orderStatusClass = computed(() => {
  if (!order.value) return ''
  return `status-${order.value.status}`
})

const statusDesc = computed(() => {
  if (!order.value) return ''
  switch (order.value.status) {
    case 'confirmed':
      return '请在入住日当天14:00后办理入住'
    case 'completed':
      return '感谢您的入住，期待再次为您服务'
    case 'cancelled':
      return '订单已取消，如有疑问请联系客服'
    case 'checked_in':
      return '您已入住，请在离店日12:00前办理退房'
    default:
      return ''
  }
})

const showActionButtons = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status)
})

const canCancel = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status)
})

const canContact = computed(() => {
  return true
})

const loadOrderDetail = async () => {
  loading.value = true
  
  try {
    const res = await hotelApi.getOrderDetail(orderId.value)
    
    if (res.data) {
      order.value = res.data
      
      if (res.data.hotel) {
        hotel.value = res.data.hotel as Hotel
      }
      if (res.data.roomType) {
        roomType.value = res.data.roomType as RoomType
      }
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

const goToHotelDetail = () => {
  if (hotel.value?.id) {
    uni.navigateTo({
      url: `/pages/hotel/hotel-detail?id=${hotel.value.id}`
    })
  }
}

const onCancelReasonSelect = async (e: any) => {
  const reason = e.text
  
  uni.showLoading({ title: '取消中...' })
  
  try {
    await hotelApi.cancelOrder(orderId.value, reason)
    
    uni.hideLoading()
    uni.showToast({
      title: '订单已取消',
      icon: 'success'
    })
    
    showCancelSheet.value = false
    
    setTimeout(() => {
      loadOrderDetail()
    }, 1000)
  } catch (error: any) {
    uni.hideLoading()
    console.error('取消订单失败:', error)
    uni.showToast({
      title: error.message || '取消失败，请重试',
      icon: 'none'
    })
  }
}

const contactService = () => {
  uni.showToast({
    title: '客服功能开发中',
    icon: 'none'
  })
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
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 180rpx;
  position: relative;
}

.status-section {
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &.status-completed {
    background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
  }
  
  &.status-cancelled {
    background: linear-gradient(135deg, #999999 0%, #666666 100%);
  }
  
  &.status-checked_in {
    background: linear-gradient(135deg, #FAAD14 0%, #D48806 100%);
  }
}

.status-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.status-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.section-divider {
  height: 20rpx;
  background: #F5F5F5;
}

.hotel-section,
.info-section,
.price-section,
.policy-section {
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

.hotel-info-card {
  display: flex;
  align-items: center;
  background: #FAFAFA;
  border-radius: 16rpx;
  padding: 20rpx;
}

.hotel-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.hotel-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.hotel-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
}

.hotel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.tag {
  font-size: 20rpx;
  color: #1890FF;
  background: #E6F7FF;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.room-name {
  font-size: 26rpx;
  color: #666666;
  font-weight: 500;
}

.room-spec {
  font-size: 22rpx;
  color: #999999;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  text-align: right;
  max-width: 60%;
}

.price-detail {
  background: #FAFAFA;
  border-radius: 16rpx;
  padding: 24rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  
  &.total {
    border-top: 2rpx solid #E8E8E8;
    margin-top: 12rpx;
    padding-top: 24rpx;
  }
}

.price-row .price-label {
  font-size: 26rpx;
  color: #666666;
}

.price-row .price-value {
  font-size: 28rpx;
  color: #333333;
}

.price-total {
  display: flex;
  align-items: baseline;
}

.price-total .symbol {
  font-size: 28rpx;
  color: #FF4D4F;
}

.price-total .amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.policy-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.policy-text {
  flex: 1;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
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

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 32rpx;
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
