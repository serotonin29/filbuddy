// Konfigurasi PM2 untuk produksi di VPS.
// Pakai: pm2 start ecosystem.config.cjs
// Update: pm2 reload filbuddy  (atau jalankan deploy/deploy.sh)

module.exports = {
  apps: [
    {
      name: "filbuddy",
      script: "npm",
      args: "start",
      cwd: "/var/www/filbuddy",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      autorestart: true,
      max_memory_restart: "512M",
      // Log
      out_file: "/var/log/filbuddy/out.log",
      error_file: "/var/log/filbuddy/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
