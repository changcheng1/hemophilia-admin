<template>
  <div class="api-test-container">
    <div class="test-panel">
      <h2>管理端API测试</h2>
      
      <div class="test-section">
        <h3>1. 获取验证码测试</h3>
        <el-button @click="testGetCaptcha" :loading="captchaLoading">
          获取验证码
        </el-button>
        <div v-if="captchaResult" class="result">
          <p>验证码Key: {{ captchaResult.key }}</p>
          <img :src="captchaResult.image" alt="验证码" style="border: 1px solid #ccc;" />
        </div>
      </div>

      <div class="test-section">
        <h3>2. 管理员登录测试</h3>
        <el-form :model="loginForm" label-width="100px">
          <el-form-item label="手机号">
            <el-input v-model="loginForm.phone" placeholder="13800138000" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="loginForm.password" type="password" placeholder="password" />
          </el-form-item>
          <el-form-item label="验证码">
            <el-input v-model="loginForm.captcha" placeholder="输入验证码" />
          </el-form-item>
          <el-form-item>
            <el-button @click="testLogin" :loading="loginLoading" type="primary">
              测试登录
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="loginResult" class="result">
          <pre>{{ JSON.stringify(loginResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>3. 忘记密码测试</h3>
        <el-form :model="forgotForm" label-width="100px">
          <el-form-item label="手机号">
            <el-input v-model="forgotForm.phone" placeholder="13800138001" />
          </el-form-item>
          <el-form-item label="验证码">
            <el-input v-model="forgotForm.captcha" placeholder="输入验证码" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="forgotForm.newPassword" type="password" placeholder="newPassword123" />
          </el-form-item>
          <el-form-item>
            <el-button @click="testForgotPassword" :loading="forgotLoading" type="warning">
              测试重置密码
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="forgotResult" class="result">
          <pre>{{ JSON.stringify(forgotResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>4. 获取当前用户测试</h3>
        <el-form :model="meForm" label-width="100px">
          <el-form-item label="JWT Token">
            <el-input v-model="meForm.token" placeholder="输入JWT Token" />
          </el-form-item>
          <el-form-item>
            <el-button @click="testGetCurrentUser" :loading="meLoading" type="success">
              获取用户信息
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="meResult" class="result">
          <pre>{{ JSON.stringify(meResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>测试日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/api/auth'

// 测试状态
const captchaLoading = ref(false)
const loginLoading = ref(false)
const forgotLoading = ref(false)
const meLoading = ref(false)

// 测试结果
const captchaResult = ref<any>(null)
const loginResult = ref<any>(null)
const forgotResult = ref<any>(null)
const meResult = ref<any>(null)

// 表单数据
const loginForm = reactive({
  phone: '18554209912',
  password: 'Aa000000',
  captcha: '',
  captchaKey: ''
})

const forgotForm = reactive({
  phone: '13800138001',
  captcha: '',
  captchaKey: '',
  newPassword: 'newPassword123'
})

const meForm = reactive({
  token: ''
})

// 日志
const logs = ref<Array<{ time: string; message: string; type: string }>>([])

const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
}

// 测试获取验证码
const testGetCaptcha = async () => {
  try {
    captchaLoading.value = true
    addLog('开始获取验证码...', 'info')
    
    const result = await authAPI.getCaptcha()
    captchaResult.value = result
    
    // 自动填充验证码key
    loginForm.captchaKey = result.key
    forgotForm.captchaKey = result.key
    
    addLog('验证码获取成功', 'success')
    ElMessage.success('验证码获取成功')
  } catch (error: any) {
    addLog(`验证码获取失败: ${error.message}`, 'error')
    ElMessage.error('验证码获取失败')
    console.error('获取验证码失败:', error)
  } finally {
    captchaLoading.value = false
  }
}

// 测试登录
const testLogin = async () => {
  try {
    loginLoading.value = true
    addLog('开始测试登录...', 'info')
    
    const result = await authAPI.login(loginForm)
    loginResult.value = result
    
    // 自动填充token
    meForm.token = result.token
    
    addLog('登录测试成功', 'success')
    ElMessage.success('登录测试成功')
  } catch (error: any) {
    addLog(`登录测试失败: ${error.response?.data?.message || error.message}`, 'error')
    ElMessage.error('登录测试失败')
    console.error('登录测试失败:', error)
  } finally {
    loginLoading.value = false
  }
}

// 测试忘记密码
const testForgotPassword = async () => {
  try {
    forgotLoading.value = true
    addLog('开始测试忘记密码...', 'info')
    
    const result = await authAPI.forgotPassword(forgotForm)
    forgotResult.value = result
    
    addLog('忘记密码测试成功', 'success')
    ElMessage.success('忘记密码测试成功')
  } catch (error: any) {
    addLog(`忘记密码测试失败: ${error.response?.data?.message || error.message}`, 'error')
    ElMessage.error('忘记密码测试失败')
    console.error('忘记密码测试失败:', error)
  } finally {
    forgotLoading.value = false
  }
}

// 测试获取当前用户
const testGetCurrentUser = async () => {
  try {
    meLoading.value = true
    addLog('开始测试获取用户信息...', 'info')
    
    // 临时设置token
    const originalToken = localStorage.getItem('admin_token')
    localStorage.setItem('admin_token', meForm.token)
    
    const result = await authAPI.getCurrentUser()
    meResult.value = result
    
    // 恢复原token
    if (originalToken) {
      localStorage.setItem('admin_token', originalToken)
    } else {
      localStorage.removeItem('admin_token')
    }
    
    addLog('获取用户信息测试成功', 'success')
    ElMessage.success('获取用户信息测试成功')
  } catch (error: any) {
    addLog(`获取用户信息测试失败: ${error.response?.data?.message || error.message}`, 'error')
    ElMessage.error('获取用户信息测试失败')
    console.error('获取用户信息测试失败:', error)
  } finally {
    meLoading.value = false
  }
}
</script>

<style scoped>
.api-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-panel {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-bottom: 32px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.test-section h3 {
  margin-bottom: 16px;
  color: #303133;
}

.result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.result pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  font-family: monospace;
}

.log-time {
  color: #909399;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-item.success .log-message {
  color: #67c23a;
}

.log-item.error .log-message {
  color: #f56c6c;
}

.log-item.info .log-message {
  color: #606266;
}
</style>