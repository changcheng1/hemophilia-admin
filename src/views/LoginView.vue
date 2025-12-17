<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h2>王定国基金会管理后台</h2>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form-content"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            size="large"
            :prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="Picture"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-image" @click="getCaptcha">
              <img 
                v-if="captchaImage" 
                :src="captchaImage" 
                alt="验证码"
                :class="{ loading: captchaLoading }"
              />
              <div v-else class="captcha-placeholder">
                <el-icon><Picture /></el-icon>
                <span>点击获取验证码</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="forgot-password-link">
            <el-button
              type="text"
              size="small"
              @click="goToForgotPassword"
            >
              忘记密码？
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Phone, Lock, Picture } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import type { LoginRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const captchaLoading = ref(false)
const captchaImage = ref('')
const captchaKey = ref('')

const loginForm = reactive<LoginRequest>({
  phone: '',
  password: '',
  captcha: '',
  captchaKey: '',
})

const loginRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' },
  ],
}

const getCaptcha = async () => {
  try {
    captchaLoading.value = true
    const response = await authAPI.getCaptcha()
    captchaImage.value = response.image
    captchaKey.value = response.key
    loginForm.captchaKey = response.key
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请重试')
  } finally {
    captchaLoading.value = false
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 确保验证码key已设置
    if (!loginForm.captchaKey) {
      loginForm.captchaKey = captchaKey.value
    }

    await authStore.login(loginForm)

    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: unknown) {
    console.error('Login failed:', error)
    
    // 如果是验证码错误，刷新验证码
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response?: { status?: number } }
      if (httpError.response?.status === 400) {
        await getCaptcha()
        loginForm.captcha = ''
      }
    }
  } finally {
    loading.value = false
  }
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  background-image: url("../assets/login_bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-form {
  width: 400px;
  height: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form-content {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.forgot-password-link {
  text-align: center;
  width: 100%;
}

.forgot-password-link .el-button {
  color: #409eff;
  font-size: 14px;
}

.forgot-password-link .el-button:hover {
  color: #66b1ff;
}

.captcha-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-container .el-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  transition: all 0.3s;
}

.captcha-image:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 3px;
  transition: opacity 0.3s;
}

.captcha-image img.loading {
  opacity: 0.6;
}

.captcha-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}

.captcha-placeholder .el-icon {
  font-size: 16px;
}
</style>
