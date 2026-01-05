<script setup>
import { reactive, onMounted } from 'vue'
import { User, Message, Iphone, ChatDotRound, ChatLineRound, Calendar, Plus, Male, Female } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const form = reactive({
  username: '', 
  avatar: '',
  nickname: '',
  gender: '1',
  age: '',
  birthday: '',
  phone: '',
  email: '',
  qq: '',
  wechat: '',
  bio: ''
})

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user_info') || '{}')
  
  form.username = user.username
  form.avatar = user.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  form.nickname = user.nickname || user.username
  form.email = user.email || ''
  
  form.gender = user.gender || '1'
  form.age = user.age
  form.birthday = user.birthday
  form.phone = user.phone
  form.qq = user.qq
  form.wechat = user.wechat
  form.bio = user.bio
})

// === 核心修复：图片转 Base64 ===
const handleAvatarChange = (uploadFile) => {
  // 1. 限制大小 (比如限制 2MB)，防止 Base64 太长把浏览器卡死
  const isLt2M = uploadFile.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return
  }

  // 2. 使用 FileReader 读取图片内容
  const reader = new FileReader()
  reader.readAsDataURL(uploadFile.raw) // 读成 Base64
  reader.onload = () => {
    // 3. 读取成功，把长长的字符串赋值给 form.avatar
    form.avatar = reader.result 
    // 这里的 reader.result 就是 "data:image/png;base64,....." 
  }
}

const handleSave = () => {
  const submitData = { ...form }
  if (submitData.age === '') submitData.age = null;

  axios.post(`http://localhost:8080/api/user/update?username=${form.username}`, submitData)
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success('个人信息保存成功！')
        
        // 1. 更新缓存
        localStorage.setItem('user_info', JSON.stringify(res.data.data))
        
        // 2. 【关键修复】发射信号！通知 Dashboard 刷新
        window.dispatchEvent(new Event('userInfoUpdated'))
        
      } else {
        ElMessage.error(res.data.msg || '保存失败')
      }
    })
    .catch(err => {
      console.error(err)
      ElMessage.error('连接服务器失败，可能是图片太大了')
    })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="welcome-header">
      <h1>个人档案</h1>
      <p>管理您的个人资料与联系方式</p>
    </div>

    <div class="profile-card">
      
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarChange"
          accept="image/png, image/jpeg, image/jpg"
        >
          <div v-if="form.avatar" class="avatar-wrapper">
            <img :src="form.avatar" class="avatar" />
            <div class="avatar-mask">
              <el-icon><Plus /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <p class="avatar-tip">支持 JPG/PNG，小于 2MB</p>
      </div>

      <el-divider class="custom-divider" />

      <el-form label-position="top" class="custom-form" size="large">
        
        <div class="form-grid">
          <el-form-item label="昵称">
            <el-input v-model="form.nickname" :prefix-icon="User" placeholder="怎么称呼您" />
          </el-form-item>

          <el-form-item label="性别">
            <el-radio-group v-model="form.gender" class="gender-group">
              <el-radio-button label="1"><el-icon class="mr-1"><Male /></el-icon> 男生</el-radio-button>
              <el-radio-button label="2"><el-icon class="mr-1"><Female /></el-icon> 女生</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="出生日期">
            <el-date-picker 
              v-model="form.birthday" 
              type="date" 
              placeholder="选择生日" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :prefix-icon="Calendar"
            />
          </el-form-item>

          <el-form-item label="年龄">
            <el-input v-model="form.age" type="number" placeholder="输入年龄" />
          </el-form-item>
        </div>

        <h3 class="section-title">联系方式</h3>
        <div class="form-grid">
          <el-form-item label="手机号码">
            <el-input v-model="form.phone" :prefix-icon="Iphone" placeholder="11位手机号" />
          </el-form-item>

          <el-form-item label="绑定邮箱">
            <el-input v-model="form.email" :prefix-icon="Message" placeholder="用于找回密码" disabled />
          </el-form-item>
          
          <el-form-item label="QQ号码">
            <el-input v-model="form.qq" :prefix-icon="ChatLineRound" placeholder="QQ号" />
          </el-form-item>

          <el-form-item label="微信号">
            <el-input v-model="form.wechat" :prefix-icon="ChatDotRound" placeholder="WeChat ID" />
          </el-form-item>
        </div>

        <h3 class="section-title">个人简介</h3>
        <el-form-item>
          <el-input 
            v-model="form.bio" 
            type="textarea" 
            rows="3" 
            placeholder="写几句关于你自己的话..."
            resize="none"
          />
        </el-form-item>

        <el-button type="primary" class="save-btn" @click="handleSave">保存所有修改</el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
/* 样式复用，无需改动 */
.content-wrapper { width: 100%; max-width: 900px; padding: 40px; margin: 0 auto; }
.welcome-header { margin-bottom: 30px; text-align: center; }
.welcome-header h1 { font-size: 32px; margin-bottom: 5px; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.welcome-header p { color: #9ca3af; }

.profile-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
.avatar-wrapper {
  position: relative; 
  
  /* 修改点：宽高从 100px 改为 150px */
  width: 150px; 
  height: 150px; 
  
  border-radius: 50%; 
  overflow: hidden;
  border: 4px solid rgba(16, 185, 129, 0.3); /* 边框也加粗一点到 4px */
  cursor: pointer; 
  transition: all 0.3s;
}
.avatar { width: 100%; height: 100%; object-fit: cover; }
.avatar-mask {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6); display: flex; flex-direction: column; justify-content: center; align-items: center;
  opacity: 0; transition: opacity 0.3s; color: white; font-size: 12px;
}
.avatar-wrapper:hover { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
.avatar-wrapper:hover .avatar-mask { opacity: 1; }
.avatar-tip { margin-top: 10px; font-size: 12px; color: rgba(255, 255, 255, 0.4); }

.custom-divider { border-color: rgba(255, 255, 255, 0.1); margin: 30px 0; }
.section-title { color: #10b981; font-size: 14px; margin: 20px 0 15px 0; font-weight: 600; letter-spacing: 1px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

:deep(.el-input__wrapper), :deep(.el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.3) !important; box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1); color: white; padding-left: 15px;
}
:deep(.el-input__wrapper.is-focus), :deep(.el-textarea__inner:focus) {
  border-color: #10b981 !important; background-color: rgba(0, 0, 0, 0.5) !important;
}
:deep(.el-form-item__label) { color: rgba(255, 255, 255, 0.6) !important; padding-bottom: 8px !important; }

:deep(.el-radio-button__inner) {
  background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); width: 100%;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) { border-radius: 4px 0 0 4px; }
:deep(.el-radio-button:last-child .el-radio-button__inner) { border-radius: 0 4px 4px 0; }
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #10b981; border-color: #10b981; box-shadow: none; color: white;
}
.mr-1 { margin-right: 4px; }

.save-btn {
  width: 100%; margin-top: 30px; height: 50px; font-size: 16px; border-radius: 8px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%); border: none; font-weight: 600; letter-spacing: 2px;
}
.save-btn:hover { box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4); transform: translateY(-2px); }
</style>