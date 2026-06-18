# Hemophilia Admin 部署指南

## 📋 项目概述

血友病非直接医疗援助后台系统，基于 Vue 3 + Element Plus 构建的管理界面。

## 🚀 部署流程

### 1. 安装依赖

```bash
npm install
```

### 2. 构建项目

```bash
# 开发环境构建
npm run build

# 生产环境构建并上传
npm run build:prod
```

### 3. 服务器部署

#### 方式一：使用 PM2 部署（推荐）

```bash
# 安装 PM2（如果未安装）
npm install -g pm2

# 启动服务
npm run pm2:start

# 查看状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 重启服务
npm run pm2:restart

# 停止服务
npm run pm2:stop
```

#### 方式二：直接运行

```bash
# 启动服务器
node server.js

# 或使用 npm
npm start
```

## 🔧 配置说明

### 环境变量

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|----------|----------|------|
| NODE_ENV | development | production | 运行环境 |
| PORT | 3003 | 3003 | 服务端口 |
| API_BASE_URL | http://127.0.0.1:3003 | http://39.107.246.96:3003 | API 地址 |

### PM2 配置

- **应用名称**: hemophilia-admin
- **启动脚本**: server.js
- **实例数量**: 1
- **内存限制**: 1GB
- **自动重启**: 启用

## 📁 目录结构

```
hemophilia-admin/
├── dist/                   # 构建输出目录
├── src/                    # 源代码
├── public/                 # 静态资源
├── server.js              # Express 服务器
├── ecosystem.config.js    # PM2 配置
├── upload.js              # 上传脚本
└── package.json           # 项目配置
```

## 🌐 访问地址

- **开发环境**: http://localhost:8080
- **生产环境**: http://39.107.246.96:8080
- **健康检查**: http://39.107.246.96:8080/health

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :8080
   
   # 修改端口
   export PORT=3003
   npm run pm2:start
   ```

2. **PM2 服务异常**
   ```bash
   # 查看 PM2 日志
   pm2 logs hemophilia-admin
   
   # 重启服务
   pm2 restart hemophilia-admin
   ```

3. **上传失败**
   ```bash
   # 检查服务器连接
   ssh root@39.107.246.96
   
   # 检查目标目录权限
   ls -la /var/www/hemophilia-admin/
   ```

## 📝 部署检查清单

- [ ] 依赖安装完成
- [ ] 项目构建成功
- [ ] 服务器连接正常
- [ ] PM2 服务启动
- [ ] 端口访问正常
- [ ] API 接口连通
- [ ] 健康检查通过

## 🔄 更新部署

```bash
# 1. 构建新版本
npm run build:prod

# 2. 重启 PM2 服务
npm run pm2:restart

# 3. 验证部署
curl http://39.107.246.96:8080/health
```

## 📊 监控和日志

```bash
# 查看 PM2 状态
pm2 status

# 查看实时日志
pm2 logs hemophilia-admin --lines 50

# 查看内存使用
pm2 monit

# 重载配置
pm2 reload ecosystem.config.js
```