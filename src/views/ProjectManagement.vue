<template>
  <div class="project-management">
    <el-card class="list-card">
      <el-table
        v-loading="loading"
        :data="projects"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="援助项目" min-width="200" />
        <el-table-column prop="supportCompany" label="援助企业" min-width="200" />
        <el-table-column prop="responsiblePerson" label="责任人员" min-width="150" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { projectApi } from '@/api/project'

interface Project {
  id: number
  name: string
  description: string
  supportCompany: string
  responsiblePerson: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const loading = ref(false)
const projects = ref<Project[]>([])

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const fetchProjects = async () => {
  loading.value = true
  try {
    const response = await projectApi.getAll()
    projects.value = response.data
  } catch (error) {
    console.error('获取项目列表失败:', error)
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped lang="scss">
.project-management {
  padding: 10px;
}

.header-card {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }
}

.list-card {
  :deep(.el-table) {
    font-size: 14px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
