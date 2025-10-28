module.exports = {
  apps: [{
    name: 'results-api-prod',
    script: './src/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3003
    },
    error_file: '/home/dynamtek/logs/results-api-error.log',
    out_file: '/home/dynamtek/logs/results-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
};
