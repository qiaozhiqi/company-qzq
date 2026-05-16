<template>
  <view class="order-confirm-container">
    <view class="hotel-section">
      <view class="section-header">
        <text class="section-title">预订酒店</text>
      </view>
      
      <view class="hotel-info-card" v-if="hotel">
        <image class="hotel-image" :src="hotel.image" mode="aspectFill" />
        <view class="hotel-info">
          <view class="hotel-name">{{ hotel.name }}</view>
          <view class="hotel-tags">
            <text class="tag" v-for="(tag, index) in hotel.tags.slice(0, 2)" :key="index">{{ tag }}</text>
          </view>
          <view class="hotel-location">
            <u-icon name="map" size="24" color="#999999"></u-icon>
            <text class="location-text">{{ hotel.address }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="room-section">
      <view class="section-header">
        <text class="section-title">选择房型</text>
        <text class="section-action" @click="showRoomPicker = true">
          {{ selectedRoom ? selectedRoom.name : '请选择房型' }}
          <u-icon name="arrow-right" size="24" color="#999999"></u-icon>
        </text>
      </view>
      
      <view class="selected-room" v-if="selectedRoom">
        <view class="room-info">
          <view class="room-name">{{ selectedRoom.name }}</view>
          <view class="room-specs">
            <text class="spec-item">{{ selectedRoom.size }}</text>
            <text class="spec-item">{{ selectedRoom.bedType }}</text>
            <text class="spec-item">{{ selectedRoom.breakfast }}</text>
          </view>
          <view class="room-policy">
            <u-icon name="info-circle" size="24" color="#1890FF"></u-icon>
            <text class="policy-text">{{ selectedRoom.cancelPolicy }}</text>
          </view>
        </view>
        <view class="room-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ selectedRoom.price }}</text>
          <text class="price-unit">/晚</text>
        </view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="date-section">
      <view class="section-header">
        <text class="section-title">入住日期</text>
      </view>
      
      <view class="date-selector" @click="showDatePicker = true">
        <view class="date-item">
          <text class="date-label">入住</text>
          <text class="date-value">{{ checkInDate }}</text>
          <text class="date-week">{{ checkInWeek }}</text>
        </view>
        <view class="date-arrow">
          <u-icon name="arrow-right" size="32" color="#1890FF"></u-icon>
        </view>
        <view class="date-item">
          <text class="date-label">离店</text>
          <text class="date-value">{{ checkOutDate }}</text>
          <text class="date-week">{{ checkOutWeek }}</text>
        </view>
        <view class="nights-badge">共 {{ nights }} 晚</view>
      </view>
    </view>
    
    <view class="section-divider"></view>
    
    <view class="guest-section">
      <view class="section-header">
        <text class="section-title">入住人信息</text>
      </view>
      
      <view class="form-item">
        <view class="form-label">姓名</view>
        <u-input 
          v-model="guestForm.guestName" 
          placeholder="请输入入住人姓名" 
          :border="false"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">手机号</view>
        <u-input 
          v-model="guestForm.guestPhone" 
          placeholder="请输入手机号" 
          :border="false"
          type="number"
          :maxlength="11"
        />
      </view>
      
      <view class="form-item room-count-item">
        <view class="form-label">房间数量</view>
        <view class="room-count-selector">
          <view class="count-btn" @click="decreaseRoomCount">
            <u-icon name="minus" size="32" :color="guestForm.roomCount <= 1 ? '#CCCCCC' : '#1890FF'"></u-icon>
          </view>
          <text class="count-value">{{ guestForm.roomCount }}</text>
          <view class="count-btn" @click="increaseRoomCount">
            <u-icon name="plus" size="32" :color="guestForm.roomCount >= maxRoomCount ? '#CCCCCC' : '#1890FF'"></u-icon>
          </view>
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
          <text class="price-label">房费 x {{ nights }}晚 x {{ guestForm.roomCount }}间</text>
          <text class="price-value">¥{{ roomPrice }}</text>
        </view>
        <view class="price-row total">
          <text class="price-label">合计</text>
          <view class="price-total">
            <text class="symbol">¥</text>
            <text class="amount">{{ totalPrice }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="payment-section">
      <view class="section-header">
        <text class="section-title">支付方式</text>
      </view>
      
      <view class="payment-options">
        <view class="payment-option" :class="{ active: selectedPayment === 'corporate' }" @click="selectedPayment = 'corporate'">
          <view class="payment-info">
            <u-icon name="company" size="36" color="#1890FF"></u-icon>
            <view class="payment-details">
              <text class="payment-name">企业对公支付</text>
              <text class="payment-desc">无需个人垫付，企业账户直接支付</text>
            </view>
          </view>
          <u-icon :name="selectedPayment === 'corporate' ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'" size="36" :color="selectedPayment === 'corporate' ? '#1890FF' : '#CCCCCC'"></u-icon>
        </view>
      </view>
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
    
    <view class="bottom-placeholder"></view>
    
    <view class="bottom-bar">
      <view class="bottom-price">
        <view class="price-label">合计</view>
        <view class="price-value">
          <text class="symbol">¥</text>
          <text class="amount">{{ totalPrice }}</text>
        </view>
      </view>
      <u-button 
        type="primary"
        :loading="submitting"
        @click="submitOrder"
        shape="circle"
        height="88rpx"
        customStyle="background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%); width: 320rpx;"
      >
        {{ submitting ? '提交中...' : '确认预订' }}
      </u-button>
    </view>
    
    <u-picker 
      :show="showRoomPicker" 
      :columns="roomColumns" 
      @confirm="onRoomConfirm" 
      @cancel="showRoomPicker = false"
    ></u-picker>
    
    <u-calendar 
      :show="showDatePicker" 
      :start-date="checkInDate" 
      :end-date="checkOutDate"
      mode="range"
      @confirm="onDateConfirm"
      @close="showDatePicker = false"
    ></u-calendar>
    
    <view class="loading-mask" v-if="loading">
      <u-loading-icon size="48" color="#1890FF"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Hotel, RoomType } from '@/types'
import { hotelApi } from '@/api'

const hotelId = ref<string>('')
const hotel = ref<(Hotel & { roomTypes: RoomType[] }) | null>(null)
const roomTypes = ref<RoomType[]>([])
const selectedRoom = ref<RoomType | null>(null)
const checkInDate = ref('')
const checkOutDate = ref('')
const showRoomPicker = ref(false)
const showDatePicker = ref(false)
const loading = ref(false)
const submitting = ref(false)

const guestForm = ref({
  guestName: '张三',
  guestPhone: '13800138000',
  roomCount: 1
})

const selectedPayment = ref('corporate')

const roomColumns = computed(() => {
  const availableRooms = roomTypes.value.filter(r => r.availableCount > 0)
  return [availableRooms.map(r => r.name)]
})

const maxRoomCount = computed(() => {
  return selectedRoom.value?.availableCount || 1
})

const nights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1
  const start = new Date(checkInDate.value)
  const end = new Date(checkOutDate.value)
  const diff = end.getTime() - start.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const checkInWeek = computed(() => {
  if (!checkInDate.value) return ''
  const date = new Date(checkInDate.value)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[date.getDay()]
})

const checkOutWeek = computed(() => {
  if (!checkOutDate.value) return ''
  const date = new Date(checkOutDate.value)
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[date.getDay()]
})

const roomPrice = computed(() => {
  if (!selectedRoom.value) return 0
  return selectedRoom.value.price * nights.value * guestForm.value.roomCount
})

const totalPrice = computed(() => {
  return roomPrice.value
})

const initDates = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  checkInDate.value = formatDate(today)
  checkOutDate.value = formatDate(tomorrow)
}

const loadHotelDetail = async () => {
  loading.value = true
  
  try {
    const res = await hotelApi.getHotelDetail(hotelId.value)
    
    if (res.data) {
      hotel.value = res.data
      roomTypes.value = res.data.roomTypes || []
      
      if (roomTypes.value.length > 0) {
        const availableRoom = roomTypes.value.find(r => r.availableCount > 0)
        if (availableRoom) {
          selectedRoom.value = availableRoom
        }
      }
    }
  } catch (error) {
    console.error('加载酒店详情失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const decreaseRoomCount = () => {
  if (guestForm.value.roomCount > 1) {
    guestForm.value.roomCount--
  }
}

const increaseRoomCount = () => {
  if (guestForm.value.roomCount < maxRoomCount.value) {
    guestForm.value.roomCount++
  }
}

const onRoomConfirm = (e: any) => {
  const roomName = e.value[0]
  const room = roomTypes.value.find(r => r.name === roomName)
  if (room) {
    selectedRoom.value = room
    guestForm.value.roomCount = 1
  }
  showRoomPicker.value = false
}

const onDateConfirm = (e: any) => {
  checkInDate.value = e[0]
  checkOutDate.value = e[1]
  showDatePicker.value = false
}

const submitOrder = async () => {
  if (!selectedRoom.value) {
    uni.showToast({
      title: '请选择房型',
      icon: 'none'
    })
    return
  }
  
  if (!guestForm.value.guestName.trim()) {
    uni.showToast({
      title: '请输入入住人姓名',
      icon: 'none'
    })
    return
  }
  
  if (!guestForm.value.guestPhone.trim() || guestForm.value.guestPhone.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  submitting.value = true
  
  try {
    const res = await hotelApi.createOrder({
      hotelId: hotelId.value,
      roomTypeId: selectedRoom.value.id,
      checkInDate: checkInDate.value,
      checkOutDate: checkOutDate.value,
      guestName: guestForm.value.guestName,
      guestPhone: guestForm.value.guestPhone,
      roomCount: guestForm.value.roomCount
    })
    
    submitting.value = false
    
    if (res.code === 200) {
      uni.showToast({
        title: '订单创建成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/hotel/payment?id=${res.data.id}`
        })
      }, 1000)
    } else {
      uni.showToast({
        title: res.message || '预订失败',
        icon: 'none'
      })
    }
  } catch (error: any) {
    submitting.value = false
    console.error('创建订单失败:', error)
    uni.showToast({
      title: error.message || '预订失败，请重试',
      icon: 'none'
    })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  
  hotelId.value = options.hotelId || ''
  
  if (!hotelId.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  initDates()
  loadHotelDetail()
})
</script>

<style lang="scss" scoped>
.order-confirm-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 180rpx;
  position: relative;
}

.hotel-section,
.room-section,
.date-section,
.guest-section,
.price-section,
.payment-section {
  background: #FFFFFF;
  padding: 32rpx;
}

.section-divider {
  height: 20rpx;
  background: #F5F5F5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.section-action {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #999999;
}

.hotel-info-card {
  display: flex;
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

.hotel-location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999999;
}

.selected-room {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: #E6F7FF;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #1890FF;
}

.room-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
}

.room-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.spec-item {
  font-size: 24rpx;
  color: #666666;
}

.room-policy {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.policy-text {
  font-size: 22rpx;
  color: #1890FF;
}

.room-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  color: #FF4D4F;
}

.price-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 24rpx;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.date-value {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.date-week {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.date-arrow {
  padding: 0 24rpx;
}

.nights-badge {
  background: #1890FF;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
  
  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
}

.room-count-item {
  justify-content: space-between;
}

.room-count-selector {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.count-btn {
  width: 56rpx;
  height: 56rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.count-value {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  min-width: 60rpx;
  text-align: center;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.bottom-price {
  display: flex;
  flex-direction: column;
}

.bottom-price .price-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.bottom-price .price-value {
  display: flex;
  align-items: baseline;
}

.bottom-price .symbol {
  font-size: 28rpx;
  color: #FF4D4F;
}

.bottom-price .amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF4D4F;
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

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.payment-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border: 2rpx solid #F5F5F5;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  
  &.active {
    border-color: #1890FF;
    background: #E6F7FF;
  }
  
  &:hover {
    border-color: #1890FF;
  }
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.payment-details {
  flex: 1;
}

.payment-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.payment-desc {
  font-size: 24rpx;
  color: #999999;
  display: block;
}
</style>
