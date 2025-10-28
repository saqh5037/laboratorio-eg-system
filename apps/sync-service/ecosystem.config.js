module.exports = {
  apps: [{
    name: 'sync-service-prod',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'fork', // Single instance for LISTEN/NOTIFY
    env_production: {
      NODE_ENV: 'production',
      HTTP_PORT: 3002
    },
    env_staging: {
      NODE_ENV: 'staging',
      HTTP_PORT: 3002
    },
    error_file: '/home/dynamtek/logs/sync-service-error.log',
    out_file: '/home/dynamtek/logs/sync-service-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '300M',
    autorestart: true,
    watch: false,
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
