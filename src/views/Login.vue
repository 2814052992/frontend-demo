<script setup>
import { reactive, ref ,onMounted,onUnmounted} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import { User, Lock, ArrowRight, Message, Key, RefreshRight , Timer} from '@element-plus/icons-vue'
import * as THREE from 'three'



const router = useRouter()

// 3D 场景变量
const threeContainer = ref(null) // 绑定 HTML 里的 div
let scene, camera, renderer, mesh, particles
let animationId = null // 用于停止动画
let morphTimer = null

// 初始化 3D 场景
const initThree = () => {
  const container = threeContainer.value
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  // 场景
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.002)

  // 相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 5

  // 渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // 创建几何体
  const geometries = [
    // 1. 晶体球
    new THREE.IcosahedronGeometry(2.2, 0),    
    
    // 2.量子扭结 (Torus Knot)
    new THREE.TorusKnotGeometry(1.5, 0.25, 120, 20), 
    
    // 3. 金字塔
    new THREE.TetrahedronGeometry(2.5),       
    
    // 4.足球烯
    new THREE.DodecahedronGeometry(2.2),      
    
    // 5. 数据立方
    new THREE.BoxGeometry(2.5, 2.5, 2.5),     
    
    // 6. 守护菱形
    new THREE.OctahedronGeometry(2.2, 0),     
    
    // 7. 能量环
    new THREE.TorusGeometry(1.8, 0.5, 16, 50) 
  ]
  
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x10b981, 
    wireframe: true,
    transparent: true,
    opacity: 0.5
  })
  
  // 初始化物体，默认先显示第一个
  mesh = new THREE.Mesh(geometries[0], material)
  scene.add(mesh)

 // 粒子星空
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 1800 // 数量
  const posArray = new Float32Array(particlesCount * 3)
  
  for(let i = 0; i < particlesCount * 3; i++) {
    // 范围
    posArray[i] = (Math.random() - 0.5) * 40 
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

  const getTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,            // 粒子大小
    color: 0x10b981,      // 绿色
    map: getTexture(),    // 挂载圆形贴图
    transparent: true,
    opacity: 0.9,         // 亮度提高
    sizeAttenuation: true,// 远小近大
    depthWrite: false,    // 去除黑边
    blending: THREE.AdditiveBlending // 光叠加模式，粒子重叠会变亮
  })
  
  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  // 鼠标视差
  let mouseX = 0, mouseY = 0
  window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1
  })

  // 变换逻辑控制
  let geometryIndex = 0
  let isMorphing = false
  
  // 清除可能存在的旧定时器
  if (morphTimer) clearInterval(morphTimer)
  // 每 3 秒触发一次“变形”
  morphTimer = setInterval(() => {
    isMorphing = true
  }, 3000)

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    // A. 持续旋转
    if (mesh) {
      mesh.rotation.x += 0.001
      mesh.rotation.y += 0.002
    }

    // B. 变换形状逻辑: 缩小 -> 换形状 -> 放大
    if (isMorphing && mesh) {
      // 缩小
      mesh.scale.x -= 0.05
      mesh.scale.y -= 0.05
      mesh.scale.z -= 0.05

      // 缩到看不见时，切换形状
      if (mesh.scale.x <= 0.01) {
        geometryIndex = (geometryIndex + 1) % geometries.length
        mesh.geometry = geometries[geometryIndex] // 偷梁换柱
        isMorphing = false // 停止缩小，转为自然放大
      }
    } else if (mesh) {
      // 弹性放大回原状
      if (mesh.scale.x < 1) {
        // lerp 插值让变大更平滑
        mesh.scale.x += (1 - mesh.scale.x) * 0.1
        mesh.scale.y += (1 - mesh.scale.y) * 0.1
        mesh.scale.z += (1 - mesh.scale.z) * 0.1
      }
    }

    // C. 粒子旋转
    if (particles) particles.rotation.y += 0.001
    
    // D. 视差跟随
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05
    camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05
    camera.lookAt(scene.position)

    renderer.render(scene, camera)
  }
  animate()

  // 窗口适配
  window.addEventListener('resize', () => {
      if(!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
  })
}

// 生命周期挂载
onMounted(() => {
  initThree() // 页面加载完启动 3D
})

onUnmounted(() => {
  // 页面销毁时清理
  cancelAnimationFrame(animationId)
  clearInterval(morphTimer)
  if (renderer) renderer.dispose()
})


// 模式控制
// mode 只有三个值: 'login' (登录), 'register' (注册), 'forgot' (找回密码)
const mode = ref('login') 
const isLoading = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '', // 注册用
  email: '',           // 注册 & 找回密码用
  newPassword: '',     // 找回密码用
  code:''              // 验证码
})

// 验证码倒计时逻辑
const countdown = ref(0) // 倒计时秒数
const isEmailSending = ref(false) // 正在发送的状态锁
let timer = null

const handleSendCode = () => {
  if (!formData.email) return ElMessage.warning('请先输入邮箱')
  // 正则验证邮箱格式
  if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(formData.email)) {
    return ElMessage.warning('邮箱格式不正确')
  }

  // 防抖检查：如果正在倒计时，或者正在发送中，直接忽略
  if (countdown.value > 0 || isEmailSending.value) return

  // 立刻上锁，按钮变灰
  isEmailSending.value = true

  // 发送请求
  // 参数1: URL
  // 参数2: data
  // 参数3: config (设置超时时间为 30秒)
  request.post(`/send-code?email=${formData.email}`, {}, { timeout: 30000 })
    .then(res => {
      console.log("后端返回：", res)
      if (res.data.code === 200) {
        ElMessage.success('验证码已发送，请查收邮件')
        
        // 开始倒计时 60秒
        countdown.value = 60
        timer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) clearInterval(timer)
        }, 1000)
      } else {
        ElMessage.error(res.data.msg)
      }
    })
    .catch(err => {
      console.error(err) // 打印错误方便调试
      ElMessage.error('发送失败，请检查网络或稍后再试')
    })
    .finally(() => {
      // 不管成功还是失败，请求结束了就把“发送锁”解开
      // 注意：如果成功了，countdown > 0 依然会让按钮保持不可点状态，逻辑是完美的
      isEmailSending.value = false
    })
}

// 核心逻辑分发
const handleSubmit = () => {
  if (mode.value === 'login') handleLogin()
  else if (mode.value === 'register') handleRegister()
  else if (mode.value === 'forgot') handleResetPassword()
}

// 1. 登录
const handleLogin = () => {
  if (!formData.username || !formData.password) return ElMessage.warning('请输入账号和密码')
  
  isLoading.value = true
  request.post('/login', {
    username: formData.username,
    password: formData.password
  }).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('登录成功')

        const resultData = res.data.data;
        // 分别存储 Token 和 用户信息
        localStorage.setItem('token', resultData.token); // 单独存 Token，以后发请求用
        localStorage.setItem('user_info', JSON.stringify(resultData.user)); // 存用户信息，用来展示头像昵称

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
  request.post('/register', {
    username: formData.username,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    email: formData.email,
    code: formData.code
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
  if (!formData.username || !formData.email || !formData.newPassword || !formData.code) {
    return ElMessage.warning('请填写所有必填项（含验证码）')
  }

  isLoading.value = true
  request.post('/reset-password', {
    username: formData.username,
    email: formData.email,
    newPassword: formData.newPassword,
    code: formData.code
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
    <div class="left-side" ref="threeContainer">
      <div class="brand-text">
        <h1>数字空间</h1>
        <p>© 2026 个人数字空间 | 鄂ICP备2026000738号-1</p>
      </div>
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

            <el-form-item v-if="mode !== 'login'">
              <div class="code-container">
                <el-input 
                  v-model="formData.code" 
                  placeholder="请输入6位验证码" 
                  :prefix-icon="Timer"
                  class="glass-input"
                  style="flex: 1" 
                />

                <el-button 
                  type="primary" 
                  class="send-btn"
                  @click="handleSendCode"
                  :disabled="countdown > 0 || isEmailSending"
                >
                  {{ isEmailSending ? '发送中...' : (countdown > 0 ? `${countdown}s后可重发` : '获取验证码') }}
                </el-button>

              </div>
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
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  background-image: radial-gradient(circle at 50% 50%, #11221c 0%, #000000 100%);
}

.left-side {
  flex: 1;
  position: relative;
  background: transparent;
  overflow: hidden; 
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
  font-size: 56px;
  margin-bottom: 10px;
  font-weight: 200;
  letter-spacing: 8px;
  font-family: 'Arial', sans-serif;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); /* 发光效果 */
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

.code-container {
  display: flex;
  width: 100%;
  gap: 15px; /* 输入框和按钮之间的间距 */
  align-items: center;
}

.send-btn {
  height: 45px; /* 和输入框一样高 */
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #10b981;
  font-weight: 600;
}
.send-btn:hover {
  background: rgba(16, 185, 129, 0.4);
  color: white;
}
.send-btn.is-disabled {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
}
</style>