<template>
  <div class="project-management">
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <el-button type="primary" @click="openProjectDialog()">新增项目</el-button>
        </div>
      </template>

      <el-form :model="searchForm" class="search-form" inline>
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.name"
            clearable
            placeholder="请输入项目名称"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="searchForm.executionDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select
            v-model="searchForm.responsiblePersonId"
            clearable
            filterable
            placeholder="请选择负责人"
            style="width: 220px"
          >
            <el-option
              v-for="admin in adminOptions"
              :key="admin.id"
              :label="`${admin.name}（${admin.phone}）`"
              :value="admin.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="filteredProjects" stripe style="width: 100%">
        <el-table-column prop="name" label="援助项目" min-width="220" />
        <el-table-column label="执行时间" min-width="180">
          <template #default="{ row }">
            {{ formatExecutionTime(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="projectPeriod" label="项目期数" min-width="120" />
        <el-table-column label="负责人" min-width="180">
          <template #default="{ row }">
            {{ formatResponsiblePersons(row) }}
          </template>
        </el-table-column>
        <el-table-column label="首页展示" width="110">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '展示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link :type="row.isActive ? 'warning' : 'success'" @click="handleToggleActive(row)">
                {{ row.isActive ? '禁用' : '展示' }}
              </el-button>
              <el-button link type="primary" @click="openProjectDialog(row)">编辑</el-button>
              <el-button link type="primary" @click="openProvinceDialog(row)">省份管理</el-button>
              <el-button link type="primary" @click="openRiskDialog(row)">风控管理</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="projectDialogVisible"
      :title="projectForm.id ? '编辑项目' : '新增项目'"
      width="760px"
      destroy-on-close
      @closed="handleProjectDialogClosed"
    >
      <el-form ref="projectFormRef" :model="projectForm" :rules="projectRules" label-width="110px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="援助企业">
          <el-input v-model="projectForm.supportCompany" placeholder="请输入援助企业" />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="projectForm.executionDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="至"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="项目期数">
          <el-input v-model="projectForm.projectPeriod" placeholder="请输入项目期数，如：一期" />
        </el-form-item>
        <el-form-item label="负责人" prop="responsiblePersonIds">
          <el-select
            v-model="projectForm.responsiblePersonIds"
            multiple
            filterable
            placeholder="请选择系统管理员"
            style="width: 100%"
          >
            <el-option
              v-for="admin in adminOptions"
              :key="admin.id"
              :label="`${admin.name}（${admin.phone}）`"
              :value="admin.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目说明" prop="description">
          <div v-if="projectDialogVisible" class="rich-editor-wrap">
            <Toolbar
              :key="`toolbar-${editorKey}`"
              :editor="descriptionEditorRef"
              :default-config="toolbarConfig"
              mode="default"
              class="rich-toolbar"
            />
            <Editor
              :key="`editor-${editorKey}`"
              v-model="projectForm.description"
              :default-config="editorConfig"
              mode="default"
              class="rich-content"
              @on-created="handleEditorCreated"
              @on-blur="syncDescriptionFromEditor"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProject">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="provinceDialogVisible" title="省份管理" width="820px">
      <div class="dialog-actions">
        <el-button type="primary" @click="openProvinceEdit()">新增省份</el-button>
      </div>
      <el-table :data="provinceForm.provinceLimits" border>
        <el-table-column prop="province" label="省份" min-width="160" />
        <el-table-column prop="limitCount" label="限制人数" min-width="120" />
        <el-table-column prop="registeredCount" label="报名人数" min-width="120" />
        <el-table-column label="操作" width="140">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="openProvinceEdit(row, $index)">编辑</el-button>
            <el-button link type="danger" @click="removeProvince($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="provinceDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProvinces">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="provinceEditVisible" :title="provinceEditIndex === null ? '新增省份' : '编辑省份'" width="560px">
      <el-form label-width="100px">
        <el-form-item label="对应省份">
          <el-select
            v-model="provinceEditForm.provinces"
            :multiple="provinceEditIndex === null"
            filterable
            placeholder="请选择省份"
            style="width: 100%"
          >
            <el-option v-for="item in availableProvinceOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="限制人数">
          <el-input-number v-model="provinceEditForm.limitCount" :min="0" :precision="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="provinceEditVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProvinceEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="riskDialogVisible" title="风控管理" width="520px">
      <el-form label-width="150px">
        <el-form-item label="三要素验证">
          <el-switch v-model="riskForm.isThreeElementEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
        <el-form-item label="户口所在地">
          <el-switch v-model="riskForm.isHouseholdLocationEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
        <el-form-item label="医保所在地">
          <el-switch v-model="riskForm.isMedicalInsuranceLocationEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
        <el-form-item label="就诊所在地">
          <el-switch v-model="riskForm.isTreatmentLocationEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="riskDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRiskControl">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { computed, onBeforeUnmount, onMounted, shallowRef, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { projectApi, type Project, type ProjectProvinceLimit } from '@/api/project'
import { adminApi, type AdminUser } from '@/api/user'

const loading = ref(false)
const saving = ref(false)
const projects = ref<Project[]>([])
const adminOptions = ref<AdminUser[]>([])
const currentProjectId = ref<number | null>(null)
const projectDialogVisible = ref(false)
const provinceDialogVisible = ref(false)
const provinceEditVisible = ref(false)
const riskDialogVisible = ref(false)
const projectFormRef = ref<FormInstance>()
const descriptionEditorRef = shallowRef<IDomEditor>()
const editorKey = ref(0)

const provinceOptions = ['北京市', '天津市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省', '重庆市', '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区']

const projectForm = ref({
  id: null as number | null,
  name: '',
  description: '',
  executionDateRange: [] as string[],
  projectPeriod: '',
  supportCompany: '',
  responsiblePersonIds: [] as number[],
})
const searchForm = ref({
  name: '',
  executionDateRange: [] as string[],
  responsiblePersonId: null as number | null,
})
const activeSearchForm = ref({
  name: '',
  executionDateRange: [] as string[],
  responsiblePersonId: null as number | null,
})

const provinceForm = ref<{ provinceLimits: ProjectProvinceLimit[] }>({
  provinceLimits: [],
})
const provinceEditIndex = ref<number | null>(null)
const provinceEditForm = ref({
  provinces: [] as string[] | string,
  limitCount: 0,
})
const riskForm = ref({
  isThreeElementEnabled: false,
  isHouseholdLocationEnabled: false,
  isMedicalInsuranceLocationEnabled: false,
  isTreatmentLocationEnabled: false,
})

const projectRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  responsiblePersonIds: [{ required: true, type: 'array', min: 1, message: '请选择负责人', trigger: 'change' }],
  description: [{ required: true, message: '请输入项目说明', trigger: 'blur' }],
}

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['uploadImage', 'uploadVideo', 'insertVideo', 'fullScreen'],
}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入将在用户端项目页面展示的项目说明',
}

const availableProvinceOptions = computed(() => {
  const selected = provinceForm.value.provinceLimits
    .filter((_, index) => index !== provinceEditIndex.value)
    .map((item) => item.province)
  return provinceOptions.filter((item) => !selected.includes(item))
})

const normalizeDate = (value?: string | null) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const isProjectInExecutionRange = (row: Project, range: string[]) => {
  if (range.length < 2 || !range[0] || !range[1]) return true
  const [searchStart, searchEnd] = range
  const projectStart = normalizeDate(row.executionStartDate)
  const projectEnd = normalizeDate(row.executionEndDate)
  if (!projectStart && !projectEnd) return false
  return (projectStart || projectEnd) <= searchEnd && (projectEnd || projectStart) >= searchStart
}

const filteredProjects = computed(() => {
  const filters = activeSearchForm.value
  return projects.value.filter((row) => {
    const nameMatched = !filters.name || row.name.includes(filters.name.trim())
    const timeMatched = isProjectInExecutionRange(row, filters.executionDateRange)
    const responsibleMatched = !filters.responsiblePersonId ||
      row.responsiblePersons?.some((item) => item.id === filters.responsiblePersonId)
    return nameMatched && timeMatched && responsibleMatched
  })
})

const handleSearch = () => {
  activeSearchForm.value = {
    name: searchForm.value.name.trim(),
    executionDateRange: [...searchForm.value.executionDateRange],
    responsiblePersonId: searchForm.value.responsiblePersonId,
  }
}

const resetSearch = () => {
  searchForm.value = {
    name: '',
    executionDateRange: [],
    responsiblePersonId: null,
  }
  handleSearch()
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

const fetchAdmins = async () => {
  try {
    const response = await adminApi.getAdmins({ page: 1, limit: 1000, isActive: true })
    adminOptions.value = response.data.data
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error('获取管理员列表失败')
  }
}

const ensureAdminsLoaded = async () => {
  if (adminOptions.value.length) return
  await fetchAdmins()
}

const formatResponsiblePersons = (row: Project) => {
  return row.responsiblePersons?.map((item) => item.name).join('、') || row.responsiblePerson || '-'
}

const formatExecutionTime = (row: Project) => {
  if (!row.executionStartDate && !row.executionEndDate) return '-'
  return `${normalizeDate(row.executionStartDate) || '-'} 至 ${normalizeDate(row.executionEndDate) || '-'}`
}

const sanitizeRichText = (html: string) => {
  if (!html) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style').forEach((node) => node.remove())
  doc.body.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        element.removeAttribute(attr.name)
      }
    })
  })
  return doc.body.innerHTML.trim()
}

const syncDescriptionFromEditor = () => {
  projectForm.value.description = sanitizeRichText(projectForm.value.description)
}

const destroyDescriptionEditor = () => {
  descriptionEditorRef.value?.destroy()
  descriptionEditorRef.value = undefined
}

const handleEditorCreated = (editor: IDomEditor) => {
  if (descriptionEditorRef.value && descriptionEditorRef.value !== editor) {
    descriptionEditorRef.value.destroy()
  }
  descriptionEditorRef.value = editor
}

const getResponsiblePersonIds = (row?: Project) => {
  if (row?.responsiblePersons?.length) {
    return row.responsiblePersons.map((item) => item.id)
  }
  const names = String(row?.responsiblePerson || '')
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return adminOptions.value
    .filter((admin) => names.includes(admin.name))
    .map((admin) => admin.id)
}

const mergeProjectDetail = (base?: Project, detail?: Project) => {
  if (!base) return detail
  if (!detail) return base

  return {
    ...base,
    ...detail,
    executionStartDate: detail.executionStartDate ?? base.executionStartDate,
    executionEndDate: detail.executionEndDate ?? base.executionEndDate,
    projectPeriod: detail.projectPeriod ?? base.projectPeriod,
    responsiblePerson: detail.responsiblePerson || base.responsiblePerson,
    responsiblePersons: detail.responsiblePersons?.length ? detail.responsiblePersons : base.responsiblePersons,
  }
}

const normalizeProjectForm = (row?: Project) => {
  const executionStartDate = normalizeDate(row?.executionStartDate)
  const executionEndDate = normalizeDate(row?.executionEndDate)

  return {
    id: row?.id || null,
    name: row?.name || '',
    description: sanitizeRichText(row?.description || ''),
    executionDateRange: executionStartDate && executionEndDate ? [executionStartDate, executionEndDate] : [],
    projectPeriod: row?.projectPeriod || '',
    supportCompany: row?.supportCompany || '',
    responsiblePersonIds: getResponsiblePersonIds(row),
  }
}

const openProjectDialog = async (row?: Project) => {
  destroyDescriptionEditor()
  await ensureAdminsLoaded()
  let detail = row
  if (row?.id) {
    try {
      const response = await projectApi.getById(row.id)
      detail = mergeProjectDetail(row, response.data)
    } catch (error) {
      console.error('获取项目详情失败，使用列表数据回显:', error)
    }
  }
  projectForm.value = {
    ...normalizeProjectForm(detail),
  }
  editorKey.value += 1
  projectFormRef.value?.clearValidate()
  projectDialogVisible.value = true
}

const handleProjectDialogClosed = () => {
  destroyDescriptionEditor()
}

const saveProject = async () => {
  const valid = await projectFormRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const data = {
      name: projectForm.value.name,
      description: sanitizeRichText(projectForm.value.description),
      executionStartDate: projectForm.value.executionDateRange[0] || null,
      executionEndDate: projectForm.value.executionDateRange[1] || null,
      projectPeriod: projectForm.value.projectPeriod,
      supportCompany: projectForm.value.supportCompany,
      responsiblePersonIds: projectForm.value.responsiblePersonIds,
    }
    if (projectForm.value.id) {
      await projectApi.update(projectForm.value.id, data)
      ElMessage.success('项目已更新')
    } else {
      await projectApi.create(data)
      ElMessage.success('项目已新增')
    }
    projectDialogVisible.value = false
    await fetchProjects()
  } finally {
    saving.value = false
  }
}

const handleToggleActive = async (row: Project) => {
  const action = row.isActive ? '禁用' : '展示'
  await ElMessageBox.confirm(`确定${action}项目“${row.name}”吗？`, '提示', { type: 'warning' })
  await projectApi.toggleActive(row.id)
  ElMessage.success(`项目已${action}`)
  await fetchProjects()
}

const openProvinceDialog = (row: Project) => {
  currentProjectId.value = row.id
  provinceForm.value.provinceLimits = normalizeProvinceLimitsForForm(row)
  provinceDialogVisible.value = true
}

const normalizeProvinceLimitsForForm = (row: Project) => {
  return (row.provinceLimits?.length
    ? row.provinceLimits
    : (row.allowedProvinces || []).map((province) => ({ province, limitCount: 0, registeredCount: 0 }))
  ).map((item) => ({ ...item }))
}

const openProvinceEdit = (row?: ProjectProvinceLimit, index?: number) => {
  provinceEditIndex.value = typeof index === 'number' ? index : null
  provinceEditForm.value = {
    provinces: row ? row.province : [],
    limitCount: row?.limitCount || 0,
  }
  provinceEditVisible.value = true
}

const confirmProvinceEdit = () => {
  const selected = Array.isArray(provinceEditForm.value.provinces)
    ? provinceEditForm.value.provinces
    : [provinceEditForm.value.provinces]
  if (!selected.length || !selected[0]) {
    ElMessage.warning('请选择省份')
    return
  }

  if (provinceEditIndex.value !== null) {
    const current = provinceForm.value.provinceLimits[provinceEditIndex.value]
    provinceForm.value.provinceLimits[provinceEditIndex.value] = {
      ...current,
      province: selected[0],
      limitCount: provinceEditForm.value.limitCount,
    }
  } else {
    provinceForm.value.provinceLimits.push(
      ...selected.map((province) => ({
        province,
        limitCount: provinceEditForm.value.limitCount,
        registeredCount: 0,
      })),
    )
  }
  provinceEditVisible.value = false
}

const removeProvince = (index: number) => {
  provinceForm.value.provinceLimits.splice(index, 1)
}

const saveProvinces = async () => {
  if (currentProjectId.value === null) return
  saving.value = true
  try {
    const response = await projectApi.updateProvinces(currentProjectId.value, provinceForm.value.provinceLimits)
    ElMessage.success('省份配置已保存')
    await fetchProjects()
    const latest = projects.value.find((item) => item.id === currentProjectId.value) || response.data
    provinceForm.value.provinceLimits = normalizeProvinceLimitsForForm(latest)
  } finally {
    saving.value = false
  }
}

const openRiskDialog = (row: Project) => {
  currentProjectId.value = row.id
  riskForm.value = {
    isThreeElementEnabled: !!row.isThreeElementEnabled,
    isHouseholdLocationEnabled: !!row.isHouseholdLocationEnabled,
    isMedicalInsuranceLocationEnabled: !!row.isMedicalInsuranceLocationEnabled,
    isTreatmentLocationEnabled: !!row.isTreatmentLocationEnabled,
  }
  riskDialogVisible.value = true
}

const saveRiskControl = async () => {
  if (currentProjectId.value === null) return
  saving.value = true
  try {
    await projectApi.updateRiskControl(currentProjectId.value, riskForm.value)
    ElMessage.success('字段配置已保存')
    riskDialogVisible.value = false
    await fetchProjects()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProjects()
  fetchAdmins()
})

onBeforeUnmount(() => {
  destroyDescriptionEditor()
})
</script>

<style scoped lang="scss">
.project-management {
  padding: 10px;
}

.card-header,
.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-actions {
  margin-bottom: 12px;
}

.list-card {
  :deep(.el-table) {
    font-size: 14px;
  }
}

.rich-editor-wrap {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.rich-toolbar {
  border-bottom: 1px solid var(--el-border-color-lighter);
  --w-e-toolbar-bg-color: #f8fafc;
  --w-e-toolbar-border-color: transparent;
}

.rich-content {
  min-height: 220px;
  --w-e-textarea-bg-color: #fff;
  --w-e-textarea-color: #303133;
  --w-e-textarea-border-color: transparent;
}
</style>
