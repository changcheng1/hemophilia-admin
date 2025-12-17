<template>
  <el-container class="main-layout">
    <!-- Mobile overlay -->
    <div 
      v-if="isMobile && !isCollapsed" 
      class="mobile-overlay" 
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <el-aside :width="sidebarWidth" class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo">
        <h2 v-if="!isCollapsed">王定国基金会管理后台</h2>
        <h2 v-else class="logo-collapsed">援助</h2>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        :collapse="isCollapsed"
        :collapse-transition="false"
      >
        <el-menu-item v-for="item in menuStore.userMenuItems" :key="item.id" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main content area -->
    <el-container>
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <!-- Sidebar toggle button -->
          <el-button
            type="text"
            class="sidebar-toggle"
            @click="toggleSidebar"
          >
            <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </el-button>

          <!-- Enhanced breadcrumb navigation -->
          <BreadcrumbNav />
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="user-name" v-if="!isMobile">{{ authStore.user?.name || '管理员' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <div class="user-info-dropdown">
                    <div class="user-name-full">{{ authStore.user?.name || '管理员' }}</div>
                    <div class="user-phone">{{ authStore.user?.phone }}</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main content -->
      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  ArrowDown, 
  Fold, 
  Expand, 
  SwitchButton 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { UserRole } from '@/types/auth'
import BreadcrumbNav from './BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()

// Responsive sidebar state
const isCollapsed = ref(false)
const isMobile = ref(false)

// Computed properties
const activeMenu = computed(() => route.path)

const sidebarWidth = computed(() => {
  if (isMobile.value && !isCollapsed.value) return '250px'
  if (isCollapsed.value) return '64px'
  return '250px'
})

// Remove unused currentPageTitle since we're using BreadcrumbNav now

// Sidebar toggle functionality
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // Store preference in localStorage
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
}

// Responsive design handling
const handleResize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768
  
  // Auto-collapse sidebar on mobile
  if (isMobile.value && !isCollapsed.value) {
    isCollapsed.value = true
  }
}

// Command handler for dropdown actions
const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
      break
  }
}

// Lifecycle hooks
onMounted(() => {
  // Restore sidebar state from localStorage
  const savedState = localStorage.getItem('sidebar-collapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
  
  // Set up responsive handling
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow: hidden;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px !important;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: white;
  border-bottom: 1px solid #434a5a;
  transition: all 0.3s ease;
}

.logo h2 {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.logo-collapsed {
  font-size: 14px !important;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  padding: 8px;
  font-size: 16px;
  color: #606266;
  border: none;
  background: none;
}


.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-role {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #606266;
  transition: all 0.3s ease;
}

.user-avatar {
  background-color: #409eff;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-info-dropdown {
  padding: 8px 0;
  text-align: center;
  min-width: 120px;
}

.user-name-full {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.user-role-full {
  font-size: 12px;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
}

/* Mobile overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Responsive design */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .header-right {
    gap: 12px;
  }
  
  .user-name {
    display: none;
  }
  
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    height: 100vh;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0 12px;
  }
  
  .breadcrumb {
    font-size: 12px;
  }
  
  .user-role {
    display: none;
  }
}

/* Dark mode support (optional enhancement) */
@media (prefers-color-scheme: dark) {
  .header {
    background-color: #1f2937;
    border-bottom-color: #374151;
    color: #f9fafb;
  }
  
  .main-content {
    background-color: #111827;
  }
}
</style>
