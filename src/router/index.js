import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Overview from '../views/Overview.vue' // 新导入
import Profile from '../views/Profile.vue'   // 新导入

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      // 父路由
      path: '/dashboard',
      component: Dashboard,
      // 【关键】子路由配置
      children: [
        {
          // 当访问 /dashboard 时，默认显示 Overview
          path: '', 
          name: 'dashboard-overview',
          component: Overview
        },
        {
          // 当访问 /dashboard/profile 时，显示 Profile
          path: 'profile', 
          name: 'dashboard-profile',
          component: Profile
        }
      ]
    }
  ]
})

export default router