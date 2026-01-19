import { createApp } from 'vue'
// 引入 Element Plus
import ElementPlus from 'element-plus'
// 引入 Element Plus 的 CSS 样式文件
import 'element-plus/dist/index.css'
// 引入图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)
// 注册路由
app.use(router)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')