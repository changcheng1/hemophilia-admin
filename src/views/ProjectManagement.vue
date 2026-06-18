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
        <el-table-column label="省份" min-width="180">
          <template #default="{ row }">
            {{ (row.allowedProvinces || []).join('、') || '全部' }}
          </template>
        </el-table-column>
        <el-table-column label="风控" min-width="140">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag :type="row.isThreeElementEnabled ? 'success' : 'info'">
                三要素{{ row.isThreeElementEnabled ? '开' : '关' }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" @click="openProvinceDialog(row)">省份管理</el-button>
              <el-button link type="primary" @click="openRiskDialog(row)">风控管理</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="provinceDialogVisible" title="省份管理" width="640px">
      <el-select v-model="provinceForm.allowedProvinces" multiple filterable placeholder="请选择开通省份" style="width: 100%">
        <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <template #footer>
        <el-button @click="provinceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProvinces">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="riskDialogVisible" title="风控管理" width="480px">
      <el-form label-width="120px">
        <el-form-item label="三要素验证">
          <el-switch v-model="riskForm.isThreeElementEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="riskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRiskControl">保存</el-button>
      </template>
    </el-dialog>
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
  allowedProvinces: string[]
  isThreeElementEnabled: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const loading = ref(false)
const projects = ref<Project[]>([])
const currentProjectId = ref<number | null>(null)
const provinceDialogVisible = ref(false)
const riskDialogVisible = ref(false)
const provinceOptions = ['北京市', '天津市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省', '重庆市', '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区']
const provinceForm = ref<{ allowedProvinces: string[] }>({ allowedProvinces: [] })
const riskForm = ref<{ isThreeElementEnabled: boolean }>({
  isThreeElementEnabled: false,
})

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

const handleView = (row: Project) => {
  ElMessage.info(`项目：${row.name}`)
}

const openProvinceDialog = (row: Project) => {
  currentProjectId.value = row.id
  provinceForm.value.allowedProvinces = [...(row.allowedProvinces || [])]
  provinceDialogVisible.value = true
}

const openRiskDialog = (row: Project) => {
  currentProjectId.value = row.id
  riskForm.value.isThreeElementEnabled = !!row.isThreeElementEnabled
  riskDialogVisible.value = true
}

const saveProvinces = async () => {
  if (currentProjectId.value === null) return
  await projectApi.updateProvinces(currentProjectId.value, provinceForm.value.allowedProvinces)
  ElMessage.success('省份配置已保存')
  provinceDialogVisible.value = false
  await fetchProjects()
}

const saveRiskControl = async () => {
  if (currentProjectId.value === null) return
  await projectApi.updateRiskControl(currentProjectId.value, riskForm.value)
  ElMessage.success('风控配置已保存')
  riskDialogVisible.value = false
  await fetchProjects()
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
