import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建一个 axios 实例
// 这就像是专门为你开通的一条"VIP通道"
const request = axios.create({
    // 基础地址：以后你发请求只需要写 '/api/login'，它会自动拼上前面的
    //本地开发
    baseURL: 'http://localhost:8081/api',
    //docker运行 
    //baseURL: '/api',
    timeout: 5000 // 请求超时时间：5秒，如果5秒后端没反应就报错
})

// 2. request 拦截器 (自动刷卡)
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

// 3. response 拦截器 (结果过滤器)
// 后端返回数据后，会先经过这里
request.interceptors.response.use(
    response => {
        // 如果后端返回 code 401 (未授权)，说明 Token 过期了或者假的
        // 这时候应该强制让用户退回登录页 (这里先简单处理，只返回结果)
        return response
    },
    error => {
        ElMessage.error('网络连接异常或服务不可用')
        return Promise.reject(error)
    }
)

// 导出这个工具，让别的页面可以用
export default request