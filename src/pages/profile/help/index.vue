<template>
  <view class="help-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <u-icon name="arrow-left" size="36" color="#333333"></u-icon>
      </view>
      <view class="header-title">帮助中心</view>
      <view class="header-right"></view>
    </view>
    
    <view class="content">
      <view class="search-bar">
        <u-icon name="search" size="28" color="#999999"></u-icon>
        <input
          type="text"
          placeholder="搜索问题"
          placeholder-style="color: #999999"
          class="search-input"
          v-model="searchKeyword"
        />
      </view>
      
      <view class="faq-section">
        <view class="section-title">常见问题</view>
        
        <view class="faq-item" v-for="(faq, index) in filteredFAQs" :key="index">
          <view class="faq-question" @click="toggleFAQ(index)">
            <text class="question-text">{{ faq.question }}</text>
            <u-icon :name="faq.expanded ? 'arrow-up' : 'arrow-down'" size="28" color="#999999"></u-icon>
          </view>
          <view class="faq-answer" v-if="faq.expanded">
            <text class="answer-text">{{ faq.answer }}</text>
          </view>
        </view>
      </view>
      
      <view class="contact-section">
        <view class="section-title">联系我们</view>
        <view class="contact-info">
          <view class="contact-item">
            <u-icon name="phone" size="32" color="#1890FF"></u-icon>
            <text class="contact-text">客服热线：400-123-4567</text>
          </view>
          <view class="contact-item">
            <u-icon name="mail" size="32" color="#1890FF"></u-icon>
            <text class="contact-text">邮箱：service@example.com</text>
          </view>
          <view class="contact-item">
            <u-icon name="clock" size="32" color="#1890FF"></u-icon>
            <text class="contact-text">工作时间：周一至周五 9:00-18:00</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface FAQ {
  question: string
  answer: string
  expanded: boolean
}

const searchKeyword = ref('')
const faqs = ref<FAQ[]>([
  {
    question: '如何预订机票？',
    answer: '您可以在首页选择"机票"选项，输入出发地、目的地和日期，点击搜索后选择合适的航班进行预订。',
    expanded: false
  },
  {
    question: '如何修改订单信息？',
    answer: '您可以在"我的订单"页面找到相应订单，点击"修改"按钮进行信息修改。请注意，部分订单可能无法修改，请以系统提示为准。',
    expanded: false
  },
  {
    question: '如何申请发票？',
    answer: '您可以在"发票信息"页面添加发票抬头，然后在订单完成后申请开具发票。',
    expanded: false
  },
  {
    question: '如何取消订单？',
    answer: '您可以在"我的订单"页面找到相应订单，点击"取消"按钮进行取消操作。请注意，部分订单可能会产生取消费用，请以系统提示为准。',
    expanded: false
  },
  {
    question: '忘记密码怎么办？',
    answer: '您可以在登录页面点击"忘记密码"，按照提示进行密码重置操作。',
    expanded: false
  }
])

const filteredFAQs = computed(() => {
  if (!searchKeyword.value) {
    return faqs.value
  }
  return faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const goBack = () => {
  uni.navigateBack()
}

const toggleFAQ = (index: number) => {
  faqs.value[index].expanded = !faqs.value[index].expanded
}
</script>

<style lang="scss" scoped>
.help-container {
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

.search-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  height: 80rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 16rpx;
  height: 100%;
}

.faq-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 24rpx;
}

.faq-item {
  border-bottom: 2rpx solid #F5F5F5;
  padding: 24rpx 0;
  
  &:last-child {
    border-bottom: none;
  }
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.question-text {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
  margin-right: 16rpx;
  line-height: 40rpx;
}

.faq-answer {
  margin-top: 16rpx;
  padding-left: 0;
}

.answer-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 40rpx;
}

.contact-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.contact-text {
  font-size: 26rpx;
  color: #666666;
  flex: 1;
}
</style>