<template>
  <el-breadcrumb separator="/" class="breadcrumb-nav">
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbItems" 
      :key="index"
      :to="item.path && index < breadcrumbItems.length - 1 ? { path: item.path } : undefined"
    >
      <el-icon v-if="item.icon" class="breadcrumb-icon">
        <component :is="item.icon" />
      </el-icon>
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
// Remove unused import

interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

const route = useRoute()
const menuStore = useMenuStore()

const breadcrumbItems = computed((): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = []
  
  // Always start with home
  items.push({
    title: '首页',
    path: '/dashboard',
    icon: 'House'
  })
  
  // Add current page if it's not the dashboard
  if (route.path !== '/dashboard') {
    const currentMenuItem = menuStore.userMenuItems.find(item => item.path === route.path)
    const pageTitle = (route.meta?.title as string) || currentMenuItem?.title || '页面'
    
    items.push({
      title: pageTitle,
      path: route.path
    })
  }
  
  return items
})
</script>

<style scoped>
.breadcrumb-nav {
  font-size: 14px;
}

.breadcrumb-icon {
  margin-right: 4px;
  font-size: 12px;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:not(:last-child)) {
  cursor: pointer;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:not(:last-child):hover .el-breadcrumb__inner) {
  color: #409eff;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #606266;
  font-weight: 500;
}
</style>