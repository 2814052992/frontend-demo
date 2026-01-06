<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SwitchButton, Monitor } from '@element-plus/icons-vue'

const router = useRouter()
const userInfo = ref({})

// 读取本地缓存的函数
const loadUserInfo = () => {
  const strInfo = localStorage.getItem('user_info')
  if (strInfo) {
    userInfo.value = JSON.parse(strInfo)
  } else {
    // 没登录就踢出去
    router.push('/login')
  }
}

onMounted(() => {
  loadUserInfo()
  // 【关键修复】监听自定义事件 "userInfoUpdated"
  // 当 Profile 页面保存成功时，会发出这个信号，这里收到信号后立刻重新读取缓存
  window.addEventListener('userInfoUpdated', loadUserInfo)
})

onUnmounted(() => {
  // 组件销毁时移除监听，养成好习惯
  window.removeEventListener('userInfoUpdated', loadUserInfo)
})

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
      <div class="header-content">
        <div class="logo-area" @click="goHome">
          <div class="logo-box">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="app-name">个人数字空间</span>
        </div>

        <div class="user-area">
          <el-tooltip content="个人设置" placement="bottom">
            <el-avatar 
              :size="48" 
              :src="userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" 
              class="user-avatar"
              @click="goToProfile"
            />
          </el-tooltip>
          
          <div class="user-info" @click="goToProfile">
            <span class="nickname">{{ userInfo.nickname || userInfo.username }}</span>
            <span class="username-text">@{{ userInfo.username }}</span>
          </div>
          
          <el-divider direction="vertical" class="custom-divider"/>
          
          <el-button type="danger" circle plain size="default" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>
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

        <el-footer class="normal-footer">
          <p>© 2026 个人数字空间，保留所有权利。</p>
          <el-divider direction="vertical" />
          <p class="icp-info">备案号待填</p>
        </el-footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局背景 */
.dashboard-wrapper {
  width: 100vw; height: 100vh; overflow: hidden;
  background: radial-gradient(circle at 80% 50%, #15523d 0%, #06291e 40%, #000000 100%);
  color: white; position: relative;
}

/* === 顶部导航栏调整 === */
.fixed-header {
  position: absolute; top: 0; left: 0; width: 100%;
  
  /* 1. 高度从 70px 增加到 80px，给大字体留空间 */
  height: 80px; 
  
  background: rgba(10, 30, 25, 0.75); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.25);
  display: flex; align-items: center; justify-content: center; padding: 0 40px; z-index: 999;
}
.header-content { width: 100%; max-width: 1400px; display: flex; justify-content: space-between; align-items: center; }

/* Logo */
.logo-area { display: flex; align-items: center; gap: 14px; cursor: pointer; transition: opacity 0.3s; }
.logo-area:hover { opacity: 0.8; }
.logo-box {
  width: 44px; height: 44px; /* Logo 也稍微大一点 */
  background: linear-gradient(135deg, #10b981, #047857);
  border-radius: 10px; display: flex; justify-content: center; align-items: center;
  font-size: 26px; box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); 
}
.app-name {
  font-size: 24px; font-weight: 700; letter-spacing: 1px;
  background: linear-gradient(to right, #ffffff, #6ee7b7);
  -webkit-background-clip: text; color: transparent;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

/* === 用户胶囊 (重点调整) === */
.user-area {
  display: flex; align-items: center; gap: 15px;
  background: rgba(16, 185, 129, 0.1); 
  /* 增加内边距 */
  padding: 6px 8px 6px 18px; 
  border-radius: 40px; 
  border: 1px solid rgba(16, 185, 129, 0.2); transition: all 0.3s;
}
.user-area:hover {
  background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.user-avatar { cursor: pointer; border: 2px solid rgba(255,255,255,0.2); }

.user-info { 
  display: flex; flex-direction: column; justify-content: center; 
  line-height: 1.4; margin-right: 8px; cursor: pointer; 
}

/* 2. 字体调大 */
.nickname { 
  font-size: 17px; /* 原来16px，改大一点 */
  font-weight: 600; 
  color: #fff; 
  letter-spacing: 0.5px;
  margin-bottom: 2px; /* 加一点下边距，别和账号挤在一起 */
}
.username-text { 
  font-size: 13px; /* 原来是 11px */
  color: #6ee7b7; 
  font-family: 'Courier New', Courier, monospace; 
  opacity: 0.9;
}

.custom-divider { border-color: rgba(255, 255, 255, 0.2); margin: 0 5px; height: 20px; }

/* 容器布局 */
.scroll-container {
  width: 100%; height: 100vh; overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
}
/* 这里 padding-top 改为 80px，因为 header 变高了 */
.content-layout { min-height: 100%; display: flex; flex-direction: column; padding-top: 80px; }
.main-content { flex: 1; width: 100%; display: flex; justify-content: center; padding: 0; }

.normal-footer {
  height: 60px; display: flex; justify-content: center; align-items: center; gap: 15px;
  font-size: 12px; color: rgba(255, 255, 255, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>