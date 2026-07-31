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
