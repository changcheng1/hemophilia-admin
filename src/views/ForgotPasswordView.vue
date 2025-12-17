<template>
  <div class="forgot-password-container">
    <div class="forgot-password-form">
      <div class="form-header">
        <h2>忘记密码</h2>
        <p>请输入您的手机号和新密码进行重置</p>
      </div>

      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        class="form-content"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="forgotForm.phone"
            placeholder="请输入手机号"
            size="large"
            :prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="forgotForm.captcha"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="Picture"
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

        <el-form-item prop="newPassword">
          <el-input
            v-model="forgotForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="forgotForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-button"
            @click="handleSubmit"
          >
            重置密码
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            type="text"
            size="large"
            class="back-button"
            @click="goBack"
          >
            返回登录
          </el-button>
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
import { authAPI } from '@/api/auth'
import type { ForgotPasswordRequest } from '@/types/auth'

const router = useRouter()

const forgotFormRef = ref<FormInstance>()
const loading = ref(false)
const captchaLoading = ref(false)
const captchaImage = ref('')
const captchaKey = ref('')

interface ForgotPasswordForm {
  phone: string
  newPassword: string
  confirmPassword: string
  captcha: string
  captchaKey: string
}

const forgotForm = reactive<ForgotPasswordForm>({
  phone: '',
  newPassword: '',
  confirmPassword: '',
  captcha: '',
  captchaKey: '',
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== forgotForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const forgotRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    { max: 20, message: '密码长度不能超过20位', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const getCaptcha = async () => {
  try {
    captchaLoading.value = true
    const response = await authAPI.getCaptcha()
    captchaImage.value = response.image
    captchaKey.value = response.key
    forgotForm.captchaKey = response.key
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请重试')
  } finally {
    captchaLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!forgotFormRef.value) return

  try {
    await forgotFormRef.value.validate()
    loading.value = true

    // 确保验证码key已设置
    if (!forgotForm.captchaKey) {
      forgotForm.captchaKey = captchaKey.value
    }

    // 调用重置密码API
    const request: ForgotPasswordRequest = {
      phone: forgotForm.phone,
      captcha: forgotForm.captcha,
      captchaKey: forgotForm.captchaKey,
      newPassword: forgotForm.newPassword
    }
    
    await authAPI.forgotPassword(request)

    ElMessage.success('密码重置成功，请使用新密码登录')
    
    // 重置成功后跳转到登录页面
    router.push('/login')
  } catch (error: unknown) {
    console.error('Reset password failed:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/login')
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.form-header p {
  color: #666;
  font-size: 14px;
}

.form-content {
  margin-top: 20px;
}

.submit-button {
  width: 100%;
}

.back-button {
  width: 100%;
  color: #409eff;
}

.back-button:hover {
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