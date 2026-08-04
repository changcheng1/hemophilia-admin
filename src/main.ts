/*
 * @Author: changcheng 364000100@#qq.com
 * @Date: 2025-12-18 13:54:38
 * @LastEditors: changcheng 364000100@#qq.com
 * @LastEditTime: 2026-08-04 09:35:33
 * @FilePath: /donation_blood/hemophilia-admin/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Global error handler for Vue errors
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  
  // Import notification store dynamically to avoid issues during app initialization
  import('@/stores/notification').then(({ useNotificationStore }) => {
    const notificationStore = useNotificationStore()
    notificationStore.handleError(err, `vue-${info}`)
  }).catch(console.error)
}

// Global warning handler for Vue warnings in development
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue warning:', msg, trace)
  }
}

app.use(createPinia())
app.use(router)

app.mount('#app')
