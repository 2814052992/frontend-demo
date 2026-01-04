<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { User, Lock, ArrowRight, Message, Key, RefreshRight } from '@element-plus/icons-vue'

const router = useRouter()

// 图片资源
const bg1  = new URL('../assets/images/1.jpg', import.meta.url).href
const bg2  = new URL('../assets/images/2.jpg', import.meta.url).href
const bg3  = new URL('../assets/images/3.jpg', import.meta.url).href
const bg4  = new URL('../assets/images/4.jpg', import.meta.url).href
const bg5  = new URL('../assets/images/5.jpg', import.meta.url).href
const bg6  = new URL('../assets/images/6.jpg', import.meta.url).href
const bg7  = new URL('../assets/images/7.jpg', import.meta.url).href
const bg8  = new URL('../assets/images/8.jpg', import.meta.url).href
const bg9  = new URL('../assets/images/9.jpg', import.meta.url).href
const bg10 = new URL('../assets/images/10.jpg', import.meta.url).href
const bg11 = new URL('../assets/images/11.jpg', import.meta.url).href
const bg12 = new URL('../assets/images/12.jpg', import.meta.url).href
const bg13 = new URL('../assets/images/13.jpg', import.meta.url).href

const carouselImages = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11, bg12, bg13]

// === 模式控制 ===
// mode 只有三个值: 'login' (登录), 'register' (注册), 'forgot' (找回密码)
const mode = ref('login') 
const isLoading = ref(false)

// === 表单数据 ===
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '', // 注册用
  email: '',           // 注册 & 找回密码用
  newPassword: ''      // 找回密码用
})

// === 核心逻辑分发 ===
const handleSubmit = () => {
  if (mode.value === 'login') handleLogin()
  else if (mode.value === 'register') handleRegister()
  else if (mode.value === 'forgot') handleResetPassword()
}

// 1. 登录
const handleLogin = () => {
  if (!formData.username || !formData.password) return ElMessage.warning('请输入账号和密码')
  
  isLoading.value = true
  axios.post('http://localhost:8080/api/login', {
    username: formData.username,
    password: formData.password
  }).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('登录成功')
        localStorage.setItem('user_info', JSON.stringify(res.data.data))
        router.push('/dashboard')
      } else ElMessage.error(res.data.msg)
    })
    .catch(err => ElMessage.error('连接服务器失败'))
    .finally(() => isLoading.value = false)
}

// 2. 注册
const handleRegister = () => {
  if (!formData.username || !formData.password || !formData.confirmPassword || !formData.email) {
    return ElMessage.warning('请填写所有必填项')
  }
  if (formData.password !== formData.confirmPassword) return ElMessage.warning('两次密码不一致')
  
  isLoading.value = true
  axios.post('http://localhost:8080/api/register', {
    username: formData.username,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    email: formData.email
  }).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('注册成功，请登录')
        mode.value = 'login'
        // 清理密码框
        formData.password = ''
        formData.confirmPassword = ''
      } else ElMessage.error(res.data.msg)
    })
    .finally(() => isLoading.value = false)
}

// 3. 找回密码
const handleResetPassword = () => {
  if (!formData.username || !formData.email || !formData.newPassword) {
    return ElMessage.warning('请填写账号、邮箱和新密码')
  }

  isLoading.value = true
  axios.post('http://localhost:8080/api/reset-password', {
    username: formData.username,
    email: formData.email,
    newPassword: formData.newPassword
  }).then(res => {
    if (res.data.code === 200) {
        ElMessage.success('密码重置成功，请登录')
        mode.value = 'login'
        formData.password = ''
        formData.newPassword = ''
    } else ElMessage.error(res.data.msg)
  }).finally(() => isLoading.value = false)
}

// 辅助文字计算
const getTitle = () => {
  if (mode.value === 'login') return '登录个人数字空间'
  if (mode.value === 'register') return '创建新账号'
  if (mode.value === 'forgot') return '找回密码'
}
const getSubTitle = () => {
  if (mode.value === 'login') return ''
  if (mode.value === 'register') return '请填写以下信息完成注册'
  if (mode.value === 'forgot') return '验证邮箱以重置密码'
}
const getBtnText = () => {
  if (isLoading.value) return '处理中...'
  if (mode.value === 'login') return '立即登录'
  if (mode.value === 'register') return '立即注册'
  if (mode.value === 'forgot') return '重置密码'
}
</script>

<template>
  <div class="login-container">
    <div class="left-side">
      <el-carousel trigger="click" height="100vh" arrow="never" :interval="4000">
        <el-carousel-item v-for="(img, index) in carouselImages" :key="index">
          <div class="carousel-image" :style="{ backgroundImage: `url(${img})` }">
            <div class="brand-text">
              <p>自拍图，要图联系我  QQ：2814052992</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="right-side">
      <div class="glass-form">
        <div class="form-content">
          <div class="title-box">
            <h2>{{ getTitle() }}</h2>
            <p>{{ getSubTitle() }}</p>
          </div>

          <el-form size="large" class="login-form">
            
            <el-form-item>
              <el-input 
                v-model="formData.username" 
                placeholder="请输入用户名" 
                :prefix-icon="User"
                class="glass-input"
              />
            </el-form-item>

            <el-form-item v-if="mode !== 'login'">
              <el-input 
                v-model="formData.email" 
                placeholder="请输入绑定邮箱" 
                :prefix-icon="Message"
                class="glass-input"
              />
            </el-form-item>
            
            <el-form-item v-if="mode !== 'forgot'">
              <el-input 
                v-model="formData.password" 
                type="password" 
                placeholder="请输入密码" 
                show-password
                :prefix-icon="Lock"
                class="glass-input"
                @keyup.enter="handleSubmit"
              />
            </el-form-item>

            <el-form-item v-if="mode === 'register'">
              <el-input 
                v-model="formData.confirmPassword" 
                type="password" 
                placeholder="再次输入密码" 
                show-password
                :prefix-icon="Key"
                class="glass-input"
              />
            </el-form-item>

            <el-form-item v-if="mode === 'forgot'">
              <el-input 
                v-model="formData.newPassword" 
                type="password" 
                placeholder="请输入新密码" 
                show-password
                :prefix-icon="RefreshRight"
                class="glass-input"
              />
            </el-form-item>

            <el-button 
              type="primary" 
              class="login-btn" 
              @click="handleSubmit"
              :loading="isLoading"
            >
              {{ getBtnText() }}
              <el-icon v-if="!isLoading" class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
            
            <div class="footer-links">
              <span v-if="mode === 'login'" @click="mode = 'register'">注册新账号</span>
              <span v-else @click="mode = 'login'">已有账号？去登录</span>
              
              <span v-if="mode === 'login'" @click="mode = 'forgot'">忘记密码?</span>
            </div>

          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 80% 50%, #15523d 0%, #06291e 40%, #000000 100%);
}

.left-side {
  flex: 1;
  position: relative;
  background: transparent;
}

.carousel-image {
  width: 100%;
  height: 100%;
  background-size: auto 80%; 
  background-repeat: no-repeat;
  background-position: center center;
  position: relative;
}

.brand-text {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 3vh; 
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
  z-index: 2;
  text-shadow: 0 4px 12px rgba(0,0,0,0.8);
}

.brand-text h1 {
  font-size: 48px;
  margin-bottom: 15px;
  font-weight: 300;
  letter-spacing: 4px;
}

.right-side {
  width: 550px;
  height: 100vh;
  position: relative;
}

.glass-form {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-top-left-radius: 30px; 
  border-bottom-left-radius: 30px;
  box-shadow: -20px 0 40px rgba(0, 0, 0, 0.6);
}

.form-content {
  width: 70%;
}

.title-box {
  margin-bottom: 50px;
  text-align: left;
}

.title-box h2 {
  color: #fff;
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: 600;
  letter-spacing: 1px;
}

.title-box p {
  color: #79a695;
  font-size: 16px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.3) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
  border-radius: 4px;
  padding: 10px 15px;
}

:deep(.el-input__inner) {
  color: white !important;
  height: 45px;
  font-size: 16px;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #42b983 !important;
}

.login-btn {
  width: 100%;
  margin-top: 40px;
  height: 55px;
  font-size: 18px;
  border-radius: 4px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border: none;
  font-weight: 600;
  letter-spacing: 2px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.login-btn:hover {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
}

.footer-links {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  color: #5d857a;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.footer-links span:hover {
  color: #10b981;
}
</style>