<template>
  <view class="feedback-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <u-icon name="arrow-left" size="36" color="#333333"></u-icon>
      </view>
      <view class="header-title">意见反馈</view>
      <view class="header-right"></view>
    </view>
    
    <view class="content">
      <view class="form-section">
        <view class="form-item">
          <view class="label">反馈类型</view>
          <view class="type-options">
            <view 
              class="type-option" 
              v-for="type in feedbackTypes" 
              :key="type.value"
              :class="{ active: selectedType === type.value }"
              @click="selectedType = type.value"
            >
              {{ type.label }}
            </view>
          </view>
        </view>
        
        <view class="form-item">
          <view class="label">反馈内容</view>
          <textarea
            v-model="feedbackContent"
            placeholder="请详细描述您的问题或建议"
            placeholder-style="color: #999999"
            class="textarea"
            rows="6"
          ></textarea>
          <view class="counter">{{ feedbackContent.length }}/500</view>
        </view>
        
        <view class="form-item">
          <view class="label">联系方式</view>
          <input
            v-model="contactInfo"
            placeholder="请留下您的手机号或邮箱，以便我们回复"
            placeholder-style="color: #999999"
            class="input"
          />
        </view>
        
        <view class="form-item">
          <view class="label">上传图片</view>
          <view class="upload-section">
            <view class="upload-btn" @click="chooseImage" v-if="images.length < 3">
              <u-icon name="camera" size="40" color="#999999"></u-icon>
              <text class="upload-text">添加图片</text>
            </view>
            <view class="image-item" v-for="(image, index) in images" :key="index">
              <image :src="image" class="uploaded-image" mode="aspectFill"></image>
              <view class="image-delete" @click="deleteImage(index)">
                <u-icon name="close-circle" size="32" color="#FF4D4F"></u-icon>
              </view>
            </view>
          </view>
          <text class="tip">最多可上传3张图片</text>
        </view>
      </view>
      
      <view class="submit-btn" @click="submitFeedback" :class="{ disabled: !canSubmit }">
        提交反馈
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedType = ref('suggestion')
const feedbackContent = ref('')
const contactInfo = ref('')
const images = ref<string[]>([])

const feedbackTypes = [
  { label: '功能建议', value: 'suggestion' },
  { label: 'bug反馈', value: 'bug' },
  { label: '其他问题', value: 'other' }
]

const canSubmit = computed(() => {
  return feedbackContent.value.trim().length > 0
})

const goBack = () => {
  uni.navigateBack()
}

const chooseImage = () => {
  uni.chooseImage({
    count: 3 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

const deleteImage = (index: number) => {
  images.value.splice(index, 1)
}

const submitFeedback = () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请填写反馈内容',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({
    title: '提交中...'
  })
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '反馈提交成功，感谢您的建议！',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.feedback-container {
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
  padding: 24rpx 32rpx;
}

.form-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16rpx;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-option {
  padding: 16rpx 24rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666666;
  cursor: pointer;
  
  &.active {
    background: #E6F7FF;
    color: #1890FF;
  }
}

.textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333333;
  resize: none;
}

.counter {
  font-size: 22rpx;
  color: #999999;
  text-align: right;
  margin-top: 8rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333333;
}

.upload-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #DDDDDD;
  cursor: pointer;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.image-delete {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #FFFFFF;
  border-radius: 50%;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.tip {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #1890FF;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &.disabled {
    background: #CCCCCC;
    cursor: not-allowed;
  }
}
</style>