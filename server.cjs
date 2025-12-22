const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const port = process.env.PORT || 3003;

// 处理 SPA 路由
app.use(history({
  index: '/index.html'
}));

// 静态文件服务
app.use(express.static(__dirname));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'hemophilia-admin',
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, () => {
  console.log(`Hemophilia Admin Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Base URL: ${process.env.API_BASE_URL || 'http://127.0.0.1:3003'}`);
});