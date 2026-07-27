module.exports = {
  apps: [
    {
      name: 'hemophilia-admin',
      script: 'server.cjs',
      cwd: __dirname,
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
        API_BASE_URL: 'http://8.147.63.4:3001'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3003,
        API_BASE_URL: 'http://127.0.0.1:3003'
      }
    }
  ]
};
