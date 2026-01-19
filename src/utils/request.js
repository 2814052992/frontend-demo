import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
    //本地开发
    baseURL: 'http://localhost:8081/api',

    //docker运行 
    //baseURL: '/api',
    timeout: 5000 // 请求超时时间：5秒，如果5秒后端没反应就报错
})

// request 拦截器
// 发送请求前，会先经过这里
request.interceptors.request.use(config => {
    // 从浏览器缓存里拿出 Token
    const token = localStorage.getItem('token')
    
    // 如果有 token，就把它贴到请求头上
    if (token) {
        config.headers['Authorization'] = token
    }
    
    return config // 放行，让请求发出去
}, error => {
    return Promise.reject(error)
})

// response 拦截器
// 后端返回数据后，会先经过这里
request.interceptors.response.use(
    response => {
        // 如果后端返回 code 401 (未授权)，说明 Token 过期了或者假的
        // 这时候应该强制让用户退回登录页
        return response
    },
    error => {
        ElMessage.error('网络连接异常或服务不可用')
        return Promise.reject(error)
    }
)

// 导出这个工具，让别的页面可以用
export default request