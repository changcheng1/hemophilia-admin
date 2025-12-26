<template>
  <div class="login-container login-page">
    <!-- 科技感动态背景 -->
    <canvas ref="canvasRef" class="tech-background"></canvas>
    
    <div class="login-form">
      <div class="login-header">
        <h2>王定国公益基金会管理系统</h2>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
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

// Canvas 相关
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

// 初始化审批后台风格背景动画
const initTechBackground = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置canvas尺寸
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  let time = 0

  // 动画循环
  const animate = () => {
    time += 0.008
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制深蓝色渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bgGradient.addColorStop(0, '#0f172a')
    bgGradient.addColorStop(0.5, '#1e3a5f')
    bgGradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制流动波浪
    drawWaves(ctx, canvas.width, canvas.height, time)

    // 绘制浮动光点
    drawFloatingDots(ctx, canvas.width, canvas.height, time)

    // 绘制几何装饰
    drawGeometricShapes(ctx, canvas.width, canvas.height, time)

    animationId = requestAnimationFrame(animate)
  }

  // 绘制多层流动波浪
  const drawWaves = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    const waveConfigs = [
      { amplitude: 50, frequency: 0.008, speed: 1, yOffset: height * 0.7, color: 'rgba(59, 130, 246, 0.08)' },
      { amplitude: 40, frequency: 0.01, speed: 1.2, yOffset: height * 0.75, color: 'rgba(37, 99, 235, 0.06)' },
      { amplitude: 60, frequency: 0.006, speed: 0.8, yOffset: height * 0.8, color: 'rgba(30, 64, 175, 0.05)' },
    ]

    waveConfigs.forEach(config => {
      ctx.beginPath()
      ctx.moveTo(0, height)
      
      for (let x = 0; x <= width; x += 5) {
        const y = config.yOffset + 
          Math.sin(x * config.frequency + t * config.speed) * config.amplitude +
          Math.sin(x * config.frequency * 0.5 + t * config.speed * 0.7) * config.amplitude * 0.5
        ctx.lineTo(x, y)
      }
      
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fillStyle = config.color
      ctx.fill()
    })
  }

  // 绘制浮动光点
  const drawFloatingDots = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    const dotCount = 30
    
    for (let i = 0; i < dotCount; i++) {
      const baseX = (i * 137.5) % width
      const baseY = (i * 89.3) % height
      const x = baseX + Math.sin(t + i * 0.5) * 30
      const y = baseY + Math.cos(t * 0.7 + i * 0.3) * 20
      const radius = 2 + Math.sin(t + i) * 1
      const opacity = 0.3 + Math.sin(t * 0.5 + i * 0.2) * 0.2

      // 光点
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(147, 197, 253, ${opacity})`
      ctx.fill()

      // 光晕
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
      gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.3})`)
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      ctx.beginPath()
      ctx.arc(x, y, radius * 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }
  }

  // 绘制几何装饰图形
  const drawGeometricShapes = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    // 左上角装饰圆环
    const cx1 = width * 0.1
    const cy1 = height * 0.2
    const r1 = 80 + Math.sin(t) * 10
    
    ctx.beginPath()
    ctx.arc(cx1, cy1, r1, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx1, cy1, r1 * 0.7, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.08)'
    ctx.stroke()

    // 右下角装饰
    const cx2 = width * 0.9
    const cy2 = height * 0.85
    const r2 = 100 + Math.cos(t * 0.8) * 15

    ctx.beginPath()
    ctx.arc(cx2, cy2, r2, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)'
    ctx.lineWidth = 3
    ctx.stroke()

    // 绘制旋转的虚线圆
    ctx.save()
    ctx.translate(cx2, cy2)
    ctx.rotate(t * 0.3)
    ctx.setLineDash([10, 20])
    ctx.beginPath()
    ctx.arc(0, 0, r2 * 1.3, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // 顶部横向渐变线条
    const lineY = height * 0.15
    const lineGradient = ctx.createLinearGradient(0, lineY, width, lineY)
    lineGradient.addColorStop(0, 'rgba(59, 130, 246, 0)')
    lineGradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.1)')
    lineGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.1)')
    lineGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
    
    ctx.beginPath()
    ctx.moveTo(0, lineY)
    ctx.lineTo(width, lineY)
    ctx.strokeStyle = lineGradient
    ctx.lineWidth = 1
    ctx.stroke()

    // 底部装饰线
    const bottomLineY = height * 0.92
    ctx.beginPath()
    ctx.moveTo(width * 0.2, bottomLineY)
    ctx.lineTo(width * 0.8, bottomLineY)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  animate()

  // 返回清理函数
  return () => {
    if (animationId) cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resizeCanvas)
  }
}

let cleanupAnimation: (() => void) | undefined

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

// 防止iOS Safari在输入框聚焦时页面滚动
const preventScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    // 延迟执行，确保键盘弹出后再滚动到顶部
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
    }, 100)
  }
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
  
  // 初始化科技感背景动画
  cleanupAnimation = initTechBackground()
  
  // 添加登录页面类到body
  document.body.classList.add('login-page')
  
  // 添加事件监听
  document.addEventListener('focusin', preventScroll)
})

// 组件卸载时清理
onUnmounted(() => {
  document.body.classList.remove('login-page')
  document.removeEventListener('focusin', preventScroll)
  
  // 清理动画
  if (cleanupAnimation) cleanupAnimation()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

/* 科技感动态背景 */
.tech-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.login-form {
  width: 100%;
  max-width: 400px;
  min-height: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(64, 158, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #1a365d;
  margin-bottom: 10px;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

/* 防止输入框聚焦时页面跳动 */
.login-form-content .el-form-item {
  margin-bottom: 20px;
}

.login-form-content .el-input {
  transition: none;
}

.login-form-content .el-input__wrapper {
  transition: none !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .login-form {
    margin-top: 0;
  }
  
  .captcha-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .captcha-image {
    width: 100%;
    height: 50px;
  }
}
</style>
