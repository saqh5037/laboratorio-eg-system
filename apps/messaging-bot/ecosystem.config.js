module.exports = {
  apps: [{
    name: 'messaging-bot-prod',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'fork', // Single instance for Telegram bot
    env_production: {
      NODE_ENV: 'production',
      PORT: 3004
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3004
    },
    error_file: '/home/dynamtek/logs/messaging-bot-error.log',
    out_file: '/home/dynamtek/logs/messaging-bot-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '400M',
    autorestart: true,
    watch: false,
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
