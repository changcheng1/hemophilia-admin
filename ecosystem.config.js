module.exports = {
  apps: [
    {
      name: 'hemophilia-admin',
      script: 'server.cjs',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        API_BASE_URL: 'http://127.0.0.1:3003'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
        API_BASE_URL: 'http://39.107.246.96:3003'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3003,
        API_BASE_URL: 'http://127.0.0.1:3003'
      }
    }
  ]
};