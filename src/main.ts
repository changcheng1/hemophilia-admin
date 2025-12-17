import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

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
app.use(ElementPlus)

app.mount('#app')
