import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import fs from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 自定义插件：复制部署文件到 dist 目录
function copyDeploymentFiles() {
  return {
    name: 'copy-deployment-files',
    writeBundle() {
      const filesToCopy = [
        'server.cjs',
        'ecosystem.config.cjs',
        'upload.js',
        'nginx.conf'
      ]
      
      filesToCopy.forEach(file => {
        const src = resolve(file)
        const dest = resolve('dist', file)
        
        if (existsSync(src)) {
          try {
            copyFileSync(src, dest)
            console.log(`✓ 已复制 ${file} 到 dist 目录`)
          } catch (error) {
            console.warn(`⚠️  复制 ${file} 失败:`, (error as Error).message)
          }
        } else {
          console.warn(`⚠️  文件不存在: ${file}`)
        }
      })

      // 创建专门的 package.json 用于部署，移除 "type": "module"
      try {
        const originalPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        
        // 只包含服务器运行时需要的依赖
        const serverDependencies = {
          "express": originalPackageJson.dependencies.express,
          "connect-history-api-fallback": originalPackageJson.dependencies["connect-history-api-fallback"]
        }
        
        const deployPackageJson = {
          name: originalPackageJson.name,
          version: originalPackageJson.version,
          private: originalPackageJson.private,
          // 移除 "type": "module" 以避免 PM2 兼容性问题
          engines: originalPackageJson.engines,
          scripts: {
            start: "node server.cjs",
            "pm2:start": "pm2 start ecosystem.config.cjs",
            "pm2:stop": "pm2 stop hemophilia-admin",
            "pm2:restart": "pm2 restart hemophilia-admin",
            "pm2:delete": "pm2 delete hemophilia-admin",
            "pm2:logs": "pm2 logs hemophilia-admin",
            "pm2:status": "pm2 status"
          },
          dependencies: serverDependencies
        }
        
        fs.writeFileSync(
          resolve('dist', 'package.json'), 
          JSON.stringify(deployPackageJson, null, 2)
        )
        console.log(`✓ 已创建部署专用的 package.json`)
      } catch (error) {
        console.warn(`⚠️  创建 package.json 失败:`, (error as Error).message)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    copyDeploymentFiles()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3003,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'http-vendor': ['axios'],
        },
      },
    },
  }
})
