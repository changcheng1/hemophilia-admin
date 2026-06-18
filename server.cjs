const express = require('express');
const path = require('path');
const fs = require('node:fs');

async function start() {
  const app = express();
  const port = process.env.PORT || 3003;
  const isProduction = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distDir, 'index.html'));

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'hemophilia-admin',
      timestamp: new Date().toISOString(),
    });
  });

  if (isProduction && hasDist) {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      root: __dirname,
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        );
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (error) {
        next(error);
      }
    });
  }

  app.listen(port, () => {
    console.log(`Hemophilia Admin Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(
      `API Base URL: ${process.env.API_BASE_URL || 'http://127.0.0.1:3003'}`,
    );
  });
}

start().catch((error) => {
  console.error('Hemophilia Admin Server failed to start:', error);
  process.exit(1);
});
