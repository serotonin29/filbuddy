#!/usr/bin/env bash
# ============================================================
# FilBuddy — script deploy/update di VPS
#
# Pertama kali (setup + deploy):
#   sudo bash deploy/deploy.sh setup
#
# Update berikutnya:
#   bash deploy/deploy.sh
# ============================================================
set -euo pipefail

APP_DIR="/var/www/filbuddy"
APP_NAME="filbuddy"
REPO_URL="https://github.com/serotonin29/filbuddy.git"

cd "$APP_DIR"

if [ "${1:-}" = "setup" ]; then
  echo "==> [1/4] Install nginx, git, Node 20, PM2"
  apt update
  apt install -y nginx git
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
  npm i -g pm2
  mkdir -p /var/log/filbuddy

  echo "==> [2/4] Clone repo"
  if [ ! -d "$APP_DIR" ]; then
    git clone "$REPO_URL" "$APP_DIR"
  fi

  echo "==> [3/4] Pasang konfigurasi nginx"
  cp "$APP_DIR/deploy/nginx-filbuddy.conf" /etc/nginx/sites-available/filbuddy
  ln -sf /etc/nginx/sites-available/filbuddy /etc/nginx/sites-enabled/filbuddy
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

if [ ! -f ".env.local" ]; then
  echo "ERROR: .env.local belum ada."
  echo "  cp .env.local.example .env.local  lalu isi nilai aslinya."
  exit 1
fi

echo "==> Pull kode terbaru"
git pull origin main

echo "==> Install dependensi & build"
npm ci
npm run build

echo "==> Restart PM2"
mkdir -p /var/log/filbuddy
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs --update-env
fi
pm2 save

echo "==> Selesai. Cek: pm2 status"
