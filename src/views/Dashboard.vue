<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const userInfo = ref({})

const loadUserInfo = () => {
  const strInfo = localStorage.getItem('user_info')
  if (strInfo) {
    userInfo.value = JSON.parse(strInfo)
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  loadUserInfo()
  window.addEventListener('userInfoUpdated', loadUserInfo)
})

onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', loadUserInfo)
})

// 事件处理函数
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  }).then(() => {
    localStorage.removeItem('user_info')
    ElMessage.success('已安全退出')
    router.push('/login')
  }).catch(() => {})
}

const goToProfile = () => router.push('/dashboard/profile')
const goHome = () => router.push('/dashboard')
</script>

<template>
  <div class="dashboard-wrapper">
    <el-header class="fixed-header">
      <AppHeader 
        :userInfo="userInfo"
        @toHome="goHome"
        @toProfile="goToProfile"
        @logout="handleLogout"
      />
    </el-header>

    <div class="scroll-container">
      <div class="content-layout">
        
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>

        <el-footer>
          <AppFooter />
        </el-footer>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100vw; height: 100vh; overflow: hidden;
  background: radial-gradient(circle at 80% 50%, #15523d 0%, #06291e 40%, #000000 100%);
  color: white; position: relative;
}

.fixed-header {
  position: absolute; top: 0; left: 0; width: 100%;
  height: 80px; 
  background: rgba(10, 30, 25, 0.75); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.25);
  display: flex; align-items: center; justify-content: center; padding: 0 40px; z-index: 999;
}

.scroll-container {
  width: 100%; height: 100vh; overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

.content-layout { min-height: 100%; display: flex; flex-direction: column; padding-top: 80px; }
.main-content { flex: 1; width: 100%; display: flex; justify-content: center; padding: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>