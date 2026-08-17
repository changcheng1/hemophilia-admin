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
            :disabled-date="disableBeforeDatePickerMinDate"
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
        <el-table-column label="入组时间" min-width="180">
          <template #default="{ row }">
            {{ formatEnrollmentTime(row) }}
          </template>
        </el-table-column>
        <el-table-column label="项目期数" min-width="120">
          <template #default="{ row }">
            {{ formatPeriodCount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="单季度额度" min-width="120">
          <template #default="{ row }">
            {{ formatAmount(row.singlePeriodLimitAmount) }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="430" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button
                link
                :type="row.isActive ? 'warning' : 'success'"
                @click="handleToggleActive(row)"
              >
                {{ row.isActive ? '禁用' : '展示' }}
              </el-button>
              <el-button link type="primary" @click="openProjectDialog(row)">编辑</el-button>
              <el-button link type="primary" @click="openPeriodDialog(row)">期数管理</el-button>
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
        <el-form-item label="单季度额度">
          <el-input-number
            v-model="projectForm.singlePeriodLimitAmount"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="请输入单季度额度"
            style="width: 240px"
          />
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
        <el-form-item label="项目通知">
          <div v-if="projectDialogVisible" class="rich-editor-wrap">
            <Toolbar
              :key="`toolbar-${projectNoticeEditorKey}`"
              :editor="projectNoticeEditorRef"
              :default-config="toolbarConfig"
              mode="default"
              class="rich-toolbar"
            />
            <Editor
              :key="`editor-${projectNoticeEditorKey}`"
              v-model="projectForm.projectNotice"
              :default-config="projectNoticeEditorConfig"
              mode="default"
              class="rich-content"
              @on-created="handleProjectNoticeEditorCreated"
              @on-blur="syncProjectNoticeFromEditor"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProject">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="periodDialogVisible"
      :title="`${currentProjectName || '项目'} - 期数管理`"
      width="820px"
    >
      <div class="dialog-actions">
        <el-button type="primary" @click="openPeriodEdit()">新增期数</el-button>
      </div>
      <el-table :data="periodForm.periods" border style="width: 100%">
        <el-table-column label="期数" min-width="180">
          <template #default="{ row }">
            {{ row.periodName }}
          </template>
        </el-table-column>
        <el-table-column label="时间周期" min-width="260">
          <template #default="{ row }">
            {{ formatPeriodRange(row) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="openPeriodEdit(row, $index)">编辑</el-button>
            <el-button link type="danger" @click="removePeriod($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="periodDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="savePeriods">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="periodEditVisible"
      :title="periodEditIndex === null ? '新增期数' : '编辑期数'"
      width="560px"
    >
      <el-form label-width="100px">
        <el-form-item label="期数名称" required>
          <el-input
            v-model="periodEditForm.periodName"
            maxlength="50"
            placeholder="请输入期数名称"
          />
        </el-form-item>
        <el-form-item label="时间周期" required>
          <div class="date-range-fields">
            <el-date-picker
              v-model="periodEditForm.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="开始日期"
            />
            <span class="date-range-separator">至</span>
            <el-date-picker
              v-model="periodEditForm.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="结束日期"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="periodEditVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPeriodEdit">保存</el-button>
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

    <el-dialog
      v-model="provinceEditVisible"
      :title="provinceEditIndex === null ? '新增省份' : '编辑省份'"
      width="560px"
    >
      <el-form label-width="100px">
        <el-form-item label="对应省份">
          <el-select
            v-model="provinceEditForm.provinces"
            :multiple="provinceEditIndex === null"
            filterable
            placeholder="请选择省份"
            style="width: 100%"
          >
            <el-option
              v-for="item in availableProvinceOptions"
              :key="item"
              :label="item"
              :value="item"
            />
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

    <el-dialog
      v-model="riskDialogVisible"
      title="风控管理"
      width="760px"
      @closed="handleRiskDialogClosed"
    >
      <el-form label-width="110px">
        <el-form-item label="执行时间">
          <div class="date-range-fields">
            <el-date-picker
              v-model="riskForm.executionStartDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="开始日期"
              :disabled-date="disableBeforeDatePickerMinDate"
            />
            <span class="date-range-separator">至</span>
            <el-date-picker
              v-model="riskForm.executionEndDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="结束日期"
              :disabled-date="disableBeforeDatePickerMinDate"
            />
          </div>
        </el-form-item>
        <el-form-item label="入组时间">
          <div class="date-range-fields">
            <el-date-picker
              v-model="riskForm.enrollmentStartDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="开始日期"
              :disabled-date="disableBeforeDatePickerMinDate"
            />
            <span class="date-range-separator">至</span>
            <el-date-picker
              v-model="riskForm.enrollmentEndDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="结束日期"
              :disabled-date="disableBeforeDatePickerMinDate"
            />
          </div>
        </el-form-item>
        <el-form-item label="项目通知">
          <div v-if="riskDialogVisible" class="rich-editor-wrap">
            <Toolbar
              :key="`toolbar-${riskNoticeEditorKey}`"
              :editor="riskNoticeEditorRef"
              :default-config="toolbarConfig"
              mode="default"
              class="rich-toolbar"
            />
            <Editor
              :key="`editor-${riskNoticeEditorKey}`"
              v-model="riskForm.projectNotice"
              :default-config="riskNoticeEditorConfig"
              mode="default"
              class="rich-content"
              @on-created="handleRiskNoticeEditorCreated"
              @on-blur="syncRiskNoticeFromEditor"
            />
          </div>
        </el-form-item>
        <el-form-item label="三要素验证">
          <el-switch v-model="riskForm.isThreeElementEnabled" active-text="开" inactive-text="关" />
        </el-form-item>
        <el-form-item label="户口所在地">
          <el-switch
            v-model="riskForm.isHouseholdLocationEnabled"
            active-text="开"
            inactive-text="关"
          />
        </el-form-item>
        <el-form-item label="医保所在地">
          <el-switch
            v-model="riskForm.isMedicalInsuranceLocationEnabled"
            active-text="开"
            inactive-text="关"
          />
        </el-form-item>
        <el-form-item label="就诊所在地">
          <el-switch
            v-model="riskForm.isTreatmentLocationEnabled"
            active-text="开"
            inactive-text="关"
          />
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
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import {
  projectApi,
  type Project,
  type ProjectPeriod,
  type ProjectProvinceLimit,
} from '@/api/project'
import { adminApi, type AdminUser } from '@/api/user'
import { disableBeforeDatePickerMinDate, normalizeBusinessDate } from '@/utils/datePicker'

const loading = ref(false)
const saving = ref(false)
const projects = ref<Project[]>([])
const adminOptions = ref<AdminUser[]>([])
const currentProjectId = ref<number | null>(null)
const currentProjectName = ref('')
const projectDialogVisible = ref(false)
const periodDialogVisible = ref(false)
const periodEditVisible = ref(false)
const provinceDialogVisible = ref(false)
const provinceEditVisible = ref(false)
const riskDialogVisible = ref(false)
const projectFormRef = ref<FormInstance>()
const descriptionEditorRef = shallowRef<IDomEditor>()
const editorKey = ref(0)
const projectNoticeEditorRef = shallowRef<IDomEditor>()
const projectNoticeEditorKey = ref(0)
const riskNoticeEditorRef = shallowRef<IDomEditor>()
const riskNoticeEditorKey = ref(0)

const provinceOptions = [
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '陕西省',
  '甘肃省',
  '青海省',
  '内蒙古自治区',
  '广西壮族自治区',
  '西藏自治区',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '香港特别行政区',
  '澳门特别行政区',
]

const projectForm = ref({
  id: null as number | null,
  name: '',
  description: '',
  projectNotice: '',
  singlePeriodLimitAmount: null as number | null,
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

const periodForm = ref<{ periods: ProjectPeriod[] }>({
  periods: [],
})
const periodEditIndex = ref<number | null>(null)
const periodEditForm = ref<ProjectPeriod>({
  periodName: '',
  startDate: '',
  endDate: '',
  isActive: true,
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
  executionStartDate: '',
  executionEndDate: '',
  enrollmentStartDate: '',
  enrollmentEndDate: '',
  projectNotice: '',
  isThreeElementEnabled: false,
  isHouseholdLocationEnabled: false,
  isMedicalInsuranceLocationEnabled: false,
  isTreatmentLocationEnabled: false,
})

const projectRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  responsiblePersonIds: [
    { required: true, type: 'array', min: 1, message: '请选择负责人', trigger: 'change' },
  ],
  description: [{ required: true, message: '请输入项目说明', trigger: 'blur' }],
}

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['uploadImage', 'uploadVideo', 'insertVideo', 'fullScreen'],
}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入将在用户端项目页面展示的项目说明',
}
const projectNoticeEditorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入将在用户端项目通知页展示的项目通知',
}
const riskNoticeEditorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入将在用户端项目通知页展示的项目通知',
}

const availableProvinceOptions = computed(() => {
  const selected = provinceForm.value.provinceLimits
    .filter((_, index) => index !== provinceEditIndex.value)
    .map((item) => item.province)
  return provinceOptions.filter((item) => !selected.includes(item))
})

const normalizeDate = (value?: string | null) => {
  return normalizeBusinessDate(value)
}

const normalizeProject = (project: Project): Project => ({
  ...project,
  description: sanitizeRichText(project.description || ''),
  executionStartDate: normalizeDate(project.executionStartDate) || null,
  executionEndDate: normalizeDate(project.executionEndDate) || null,
  enrollmentStartDate: normalizeDate(project.enrollmentStartDate) || null,
  enrollmentEndDate: normalizeDate(project.enrollmentEndDate) || null,
  projectNotice: normalizeOptionalRichText(project.projectNotice),
  projectPeriod: project.projectPeriod || '',
  singlePeriodLimitAmount:
    project.singlePeriodLimitAmount === null || project.singlePeriodLimitAmount === undefined
      ? null
      : Number(project.singlePeriodLimitAmount),
  periodCount: project.periodCount || project.periods?.length || 0,
  periods: project.periods || [],
  supportCompany: project.supportCompany || '',
  responsiblePerson:
    project.responsiblePerson ||
    project.responsiblePersons?.map((item) => item.name).join('、') ||
    '',
  responsiblePersonIds:
    project.responsiblePersonIds || project.responsiblePersons?.map((item) => item.id) || [],
  responsiblePersons: project.responsiblePersons || [],
  allowedProvinces: project.allowedProvinces || [],
  provinceLimits: project.provinceLimits || [],
})

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
    const responsibleMatched =
      !filters.responsiblePersonId ||
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
    projects.value = response.data.map(normalizeProject)
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

const formatEnrollmentTime = (row: Project) => {
  if (!row.enrollmentStartDate && !row.enrollmentEndDate) return '-'
  return `${normalizeDate(row.enrollmentStartDate) || '-'} 至 ${normalizeDate(row.enrollmentEndDate) || '-'}`
}

const formatAmount = (value?: number | null) => {
  if (value === null || value === undefined) return '-'
  const amount = Number(value)
  if (Number.isNaN(amount)) return '-'
  return `${amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} 元`
}

const formatPeriodCount = (row: Project) => {
  const count = row.periodCount ?? row.periods?.length ?? 0
  return count ? `${count}` : '-'
}

const formatPeriodRange = (row: ProjectPeriod) => {
  return `${normalizeDate(row.startDate) || '-'} 至 ${normalizeDate(row.endDate) || '-'}`
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

const normalizeOptionalRichText = (value?: string | null) => {
  const sanitized = sanitizeRichText(value || '')
  if (!sanitized) return null
  const doc = new DOMParser().parseFromString(sanitized, 'text/html')
  return doc.body.textContent?.trim() ? sanitized : null
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
  nextTick(() => {
    editor.setHtml(projectForm.value.description || '')
  })
}

const syncProjectNoticeFromEditor = () => {
  projectForm.value.projectNotice = sanitizeRichText(projectForm.value.projectNotice)
}

const destroyProjectNoticeEditor = () => {
  projectNoticeEditorRef.value?.destroy()
  projectNoticeEditorRef.value = undefined
}

const handleProjectNoticeEditorCreated = (editor: IDomEditor) => {
  if (projectNoticeEditorRef.value && projectNoticeEditorRef.value !== editor) {
    projectNoticeEditorRef.value.destroy()
  }
  projectNoticeEditorRef.value = editor
  nextTick(() => {
    editor.setHtml(projectForm.value.projectNotice || '')
  })
}

const syncRiskNoticeFromEditor = () => {
  riskForm.value.projectNotice = sanitizeRichText(riskForm.value.projectNotice)
}

const destroyRiskNoticeEditor = () => {
  riskNoticeEditorRef.value?.destroy()
  riskNoticeEditorRef.value = undefined
}

const handleRiskNoticeEditorCreated = (editor: IDomEditor) => {
  if (riskNoticeEditorRef.value && riskNoticeEditorRef.value !== editor) {
    riskNoticeEditorRef.value.destroy()
  }
  riskNoticeEditorRef.value = editor
  nextTick(() => {
    editor.setHtml(riskForm.value.projectNotice || '')
  })
}

const getResponsiblePersonIds = (row?: Project) => {
  if (row?.responsiblePersonIds?.length) {
    return row.responsiblePersonIds
  }
  if (row?.responsiblePersons?.length) {
    return row.responsiblePersons.map((item) => item.id)
  }
  const names = String(row?.responsiblePerson || '')
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return adminOptions.value.filter((admin) => names.includes(admin.name)).map((admin) => admin.id)
}

const mergeProjectDetail = (base?: Project, detail?: Project) => {
  if (!base) return detail ? normalizeProject(detail) : detail
  if (!detail) return normalizeProject(base)

  return normalizeProject({
    ...base,
    ...detail,
    executionStartDate: detail.executionStartDate ?? base.executionStartDate,
    executionEndDate: detail.executionEndDate ?? base.executionEndDate,
    enrollmentStartDate: detail.enrollmentStartDate ?? base.enrollmentStartDate,
    enrollmentEndDate: detail.enrollmentEndDate ?? base.enrollmentEndDate,
    projectNotice: detail.projectNotice ?? base.projectNotice,
    projectPeriod: detail.projectPeriod ?? base.projectPeriod,
    singlePeriodLimitAmount: detail.singlePeriodLimitAmount ?? base.singlePeriodLimitAmount,
    periodCount: detail.periodCount ?? base.periodCount,
    periods: detail.periods?.length ? detail.periods : base.periods,
    description: detail.description || base.description,
    responsiblePerson: detail.responsiblePerson || base.responsiblePerson,
    responsiblePersonIds: detail.responsiblePersonIds?.length
      ? detail.responsiblePersonIds
      : base.responsiblePersonIds,
    responsiblePersons: detail.responsiblePersons?.length
      ? detail.responsiblePersons
      : base.responsiblePersons,
  })
}

const normalizeProjectForm = (row?: Project) => {
  const normalized = row ? normalizeProject(row) : undefined

  return {
    id: normalized?.id || null,
    name: normalized?.name || '',
    description: normalized?.description || '',
    projectNotice: normalized?.projectNotice || '',
    singlePeriodLimitAmount:
      normalized?.singlePeriodLimitAmount === null ||
      normalized?.singlePeriodLimitAmount === undefined
        ? null
        : Number(normalized.singlePeriodLimitAmount),
    supportCompany: normalized?.supportCompany || '',
    responsiblePersonIds: getResponsiblePersonIds(normalized),
  }
}

const openProjectDialog = async (row?: Project) => {
  destroyDescriptionEditor()
  destroyProjectNoticeEditor()
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
  projectNoticeEditorKey.value += 1
  projectFormRef.value?.clearValidate()
  projectDialogVisible.value = true
}

const handleProjectDialogClosed = () => {
  destroyDescriptionEditor()
  destroyProjectNoticeEditor()
}

const saveProject = async () => {
  const valid = await projectFormRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const data = {
      name: projectForm.value.name,
      description: sanitizeRichText(projectForm.value.description),
      projectNotice: normalizeOptionalRichText(projectForm.value.projectNotice),
      singlePeriodLimitAmount: projectForm.value.singlePeriodLimitAmount,
      supportCompany: projectForm.value.supportCompany,
      responsiblePersonIds: projectForm.value.responsiblePersonIds,
    }
    if (projectForm.value.id) {
      const response = await projectApi.update(projectForm.value.id, data)
      projectForm.value = normalizeProjectForm(response.data)
      ElMessage.success('项目已更新')
    } else {
      const response = await projectApi.create(data)
      projectForm.value = normalizeProjectForm(response.data)
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

const normalizePeriodsForForm = (periods: ProjectPeriod[] = []) => {
  return periods
    .map((item, index) => ({
      ...item,
      periodName: item.periodName || '',
      startDate: normalizeDate(item.startDate),
      endDate: normalizeDate(item.endDate),
      sortOrder: item.sortOrder ?? index,
      isActive: item.isActive !== false,
    }))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
}

const openPeriodDialog = async (row: Project) => {
  currentProjectId.value = row.id
  currentProjectName.value = row.name
  periodForm.value.periods = normalizePeriodsForForm(row.periods || [])
  periodDialogVisible.value = true

  try {
    const response = await projectApi.getPeriods(row.id)
    periodForm.value.periods = normalizePeriodsForForm(response.data)
  } catch (error) {
    console.error('获取项目期数失败，使用列表数据回显:', error)
  }
}

const openPeriodEdit = (row?: ProjectPeriod, index?: number) => {
  periodEditIndex.value = typeof index === 'number' ? index : null
  periodEditForm.value = {
    ...row,
    periodName: row?.periodName || '',
    startDate: normalizeDate(row?.startDate),
    endDate: normalizeDate(row?.endDate),
    isActive: row?.isActive !== false,
  }
  periodEditVisible.value = true
}

const confirmPeriodEdit = () => {
  const periodName = periodEditForm.value.periodName.trim()
  if (!periodName) {
    ElMessage.warning('请输入期数名称')
    return
  }
  if (!periodEditForm.value.startDate && !periodEditForm.value.endDate) {
    ElMessage.warning('请至少选择开始日期或结束日期')
    return
  }
  if (
    periodEditForm.value.startDate &&
    periodEditForm.value.endDate &&
    periodEditForm.value.startDate > periodEditForm.value.endDate
  ) {
    ElMessage.warning('开始日期不能晚于结束日期')
    return
  }

  const nextPeriod: ProjectPeriod = {
    ...periodEditForm.value,
    periodName,
    startDate: periodEditForm.value.startDate || null,
    endDate: periodEditForm.value.endDate || null,
    isActive: periodEditForm.value.isActive !== false,
  }

  if (periodEditIndex.value !== null) {
    periodForm.value.periods[periodEditIndex.value] = nextPeriod
  } else {
    periodForm.value.periods.push(nextPeriod)
  }
  periodForm.value.periods = normalizePeriodsForForm(periodForm.value.periods)
  periodEditVisible.value = false
}

const removePeriod = (index: number) => {
  periodForm.value.periods.splice(index, 1)
  periodForm.value.periods = normalizePeriodsForForm(periodForm.value.periods)
}

const savePeriods = async () => {
  if (currentProjectId.value === null) return
  saving.value = true
  try {
    const periods = periodForm.value.periods.map((item, index) => ({
      ...item,
      periodName: item.periodName.trim(),
      startDate: item.startDate || null,
      endDate: item.endDate || null,
      sortOrder: index,
      isActive: item.isActive !== false,
    }))
    const response = await projectApi.updatePeriods(currentProjectId.value, periods)
    periodForm.value.periods = normalizePeriodsForForm(response.data)
    ElMessage.success('期数配置已保存')
    await fetchProjects()
  } finally {
    saving.value = false
  }
}

const openProvinceDialog = (row: Project) => {
  currentProjectId.value = row.id
  currentProjectName.value = row.name
  provinceForm.value.provinceLimits = normalizeProvinceLimitsForForm(row)
  provinceDialogVisible.value = true
}

const normalizeProvinceLimitsForForm = (row: Project) => {
  return (
    row.provinceLimits?.length
      ? row.provinceLimits
      : (row.allowedProvinces || []).map((province) => ({
          province,
          limitCount: 0,
          registeredCount: 0,
        }))
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
    const response = await projectApi.updateProvinces(
      currentProjectId.value,
      provinceForm.value.provinceLimits,
    )
    ElMessage.success('省份配置已保存')
    await fetchProjects()
    const latest =
      projects.value.find((item) => item.id === currentProjectId.value) || response.data
    provinceForm.value.provinceLimits = normalizeProvinceLimitsForForm(latest)
  } finally {
    saving.value = false
  }
}

const openRiskDialog = (row: Project) => {
  destroyRiskNoticeEditor()
  currentProjectId.value = row.id
  riskForm.value = {
    executionStartDate: normalizeBusinessDate(row.executionStartDate),
    executionEndDate: normalizeBusinessDate(row.executionEndDate),
    enrollmentStartDate: normalizeBusinessDate(row.enrollmentStartDate),
    enrollmentEndDate: normalizeBusinessDate(row.enrollmentEndDate),
    projectNotice: normalizeOptionalRichText(row.projectNotice) || '',
    isThreeElementEnabled: !!row.isThreeElementEnabled,
    isHouseholdLocationEnabled: !!row.isHouseholdLocationEnabled,
    isMedicalInsuranceLocationEnabled: !!row.isMedicalInsuranceLocationEnabled,
    isTreatmentLocationEnabled: !!row.isTreatmentLocationEnabled,
  }
  riskNoticeEditorKey.value += 1
  riskDialogVisible.value = true
}

const handleRiskDialogClosed = () => {
  destroyRiskNoticeEditor()
}

const saveRiskControl = async () => {
  if (currentProjectId.value === null) return
  if (
    riskForm.value.executionStartDate &&
    riskForm.value.executionEndDate &&
    riskForm.value.executionStartDate > riskForm.value.executionEndDate
  ) {
    ElMessage.warning('执行时间开始日期不能晚于结束日期')
    return
  }
  if (
    riskForm.value.enrollmentStartDate &&
    riskForm.value.enrollmentEndDate &&
    riskForm.value.enrollmentStartDate > riskForm.value.enrollmentEndDate
  ) {
    ElMessage.warning('入组时间开始日期不能晚于结束日期')
    return
  }
  saving.value = true
  try {
    await projectApi.updateRiskControl(currentProjectId.value, {
      executionStartDate: riskForm.value.executionStartDate || null,
      executionEndDate: riskForm.value.executionEndDate || null,
      enrollmentStartDate: riskForm.value.enrollmentStartDate || null,
      enrollmentEndDate: riskForm.value.enrollmentEndDate || null,
      projectNotice: normalizeOptionalRichText(riskForm.value.projectNotice),
      isThreeElementEnabled: riskForm.value.isThreeElementEnabled,
      isHouseholdLocationEnabled: riskForm.value.isHouseholdLocationEnabled,
      isMedicalInsuranceLocationEnabled: riskForm.value.isMedicalInsuranceLocationEnabled,
      isTreatmentLocationEnabled: riskForm.value.isTreatmentLocationEnabled,
    })
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
  destroyProjectNoticeEditor()
  destroyRiskNoticeEditor()
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
