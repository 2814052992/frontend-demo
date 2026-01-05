<script setup>
import { ref } from 'vue'
import { Calendar } from '@element-plus/icons-vue'

// 模拟数据
const mockList = ref(new Array(20).fill('').map((_, index) => ({
  id: index + 1,
  title: `工作任务测试卡片 - ${index + 1}`,
  date: '2026-01-05',
  content: '这是一条很长的测试内容，用来把页面撑开，测试底部是否会被挤下去。'
})))
</script>

<template>
  <div class="content-wrapper">
    <div class="welcome-header">
      <h1>Dashboard</h1>
      <p>概览 / 工作台</p>
    </div>

    <div class="card-grid">
      <div v-for="item in mockList" :key="item.id" class="glass-card">
        <div class="card-header">
          <el-icon><Calendar /></el-icon>
          <span>{{ item.title }}</span>
        </div>
        <p>{{ item.content }}</p>
        <div class="card-footer">
          <span>{{ item.date }}</span>
          <el-button link type="primary">查看详情</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式直接复用之前的 */
.content-wrapper { width: 100%; max-width: 1400px; padding: 40px; margin: 0 auto; }
.welcome-header { margin-bottom: 30px; }
.welcome-header h1 { font-size: 32px; margin-bottom: 5px; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.welcome-header p { color: #9ca3af; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px; padding: 20px; transition: all 0.3s;
}
.glass-card:hover {
  background: rgba(255, 255, 255, 0.1); transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  border-color: rgba(16, 185, 129, 0.3);
}
.card-header { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #10b981; }
.glass-card p { font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.6; margin-bottom: 20px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255, 255, 255, 0.4); }
</style>