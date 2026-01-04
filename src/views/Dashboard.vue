<template>
  <div class="dashboard-container">
    <h1>欢迎进入个人数字空间！</h1>
    <p>主页开发中</p>
    <el-button type="danger" @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleLogout = () => {
  // 1. 清除本地存储的用户信息
  localStorage.removeItem('user_info')
  // 2. 提示
  ElMessage.success('退出成功')
  // 3.以此跳转回登录页
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  padding: 50px;
  text-align: center;
}
</style>