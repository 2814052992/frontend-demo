<script setup>
// 1. 引入图标
import { Monitor, SwitchButton } from '@element-plus/icons-vue'

// 2. 定义接收的数据
defineProps(['userInfo'])

// 3. 定义发射的事件
const emit = defineEmits(['toHome', 'toProfile', 'logout'])
</script>

<template>
  <div class="header-content">
    <div class="logo-area" @click="emit('toHome')">
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
          @click="emit('toProfile')"
        />
      </el-tooltip>
      
      <div class="user-info" @click="emit('toProfile')">
        <span class="nickname">{{ userInfo.nickname || userInfo.username }}</span>
        <span class="username-text">@{{ userInfo.username }}</span>
      </div>
      
      <el-divider direction="vertical" class="custom-divider"/>
      
      <el-button type="danger" circle plain size="default" @click="emit('logout')">
        <el-icon><SwitchButton /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.header-content { width: 100%; max-width: 1400px; display: flex; justify-content: space-between; align-items: center; }

/* Logo */
.logo-area { display: flex; align-items: center; gap: 14px; cursor: pointer; transition: opacity 0.3s; }
.logo-area:hover { opacity: 0.8; }
.logo-box {
  width: 44px; height: 44px; 
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

/* 用户胶囊 */
.user-area {
  display: flex; align-items: center; gap: 15px;
  background: rgba(16, 185, 129, 0.1); 
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
.nickname { 
  font-size: 17px; font-weight: 600; color: #fff; letter-spacing: 0.5px; margin-bottom: 2px;
}
.username-text { 
  font-size: 13px; color: #6ee7b7; font-family: 'Courier New', Courier, monospace; opacity: 0.9;
}
.custom-divider { border-color: rgba(255, 255, 255, 0.2); margin: 0 5px; height: 20px; }
</style>