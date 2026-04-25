<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch(() => {
  console.log('App Launch')
  initApp()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

const initApp = async () => {
  const userStore = useUserStore()
  await userStore.checkLoginStatus()
  
  if (!userStore.isLoggedIn) {
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }
}
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/styles/global.scss';

page {
  height: 100%;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: #333333;
}

.container {
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-primary {
  color: #1890FF;
}

.text-success {
  color: #52c41a;
}

.text-warning {
  color: #faad14;
}

.text-danger {
  color: #ff4d4f;
}

.text-secondary {
  color: #999999;
}

.text-bold {
  font-weight: bold;
}

.mt-10 {
  margin-top: 10rpx;
}

.mt-20 {
  margin-top: 20rpx;
}

.mb-10 {
  margin-bottom: 10rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.p-20 {
  padding: 20rpx;
}
</style>
