#!/bin/bash
# ─── SAIM — Setup VPS Ubuntu 22.04 / 24.04 ───────────────────────────────────
# À exécuter UNE seule fois sur le VPS (lancé par deploy.sh --setup)

set -euo pipefail

DOMAIN="course.mysaim.com"
APP_DIR="/var/www/mysaim"
APP_PORT="5001"
SSL_EMAIL="admin@mysaim.com"

R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m' B='\033[0;34m' C='\033[0;36m' NC='\033[0m'
log()     { echo -e "${B}[SETUP]${NC} $1"; }
success() { echo -e "${G}  ✓ $1${NC}"; }
error()   { echo -e "${R}  ✗ $1${NC}"; exit 1; }
warn()    { echo -e "${Y}  ⚠ $1${NC}"; }

echo ""
echo -e "${C}╔══════════════════════════════════════════════╗${NC}"
echo -e "${C}║  SAIM AI — Installation VPS                  ║${NC}"
echo -e "${C}║  Domaine : $DOMAIN       ║${NC}"
echo -e "${C}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Système ──────────────────────────────────────────────────────────────
log "Mise à jour système..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
apt-get install -y -qq curl git unzip nginx certbot python3-certbot-nginx ufw sqlite3
success "Système à jour"

# ─── 2. Node.js 20 ───────────────────────────────────────────────────────────
log "Node.js..."
NODE_VER=$(node -v 2>/dev/null | sed 's/v//' | cut -d'.' -f1 || echo "0")
if [ "$NODE_VER" -lt "20" ] 2>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
success "Node.js $(node -v)"

# ─── 3. PM2 ──────────────────────────────────────────────────────────────────
log "PM2..."
npm install -g pm2 --quiet
pm2 startup systemd -u root --hp /root 2>/dev/null || true
success "PM2 $(pm2 -v)"

# ─── 4. Dossiers ─────────────────────────────────────────────────────────────
mkdir -p "$APP_DIR/backend/db/backups"
mkdir -p "$APP_DIR/images"
mkdir -p "$APP_DIR/uploads"
chmod 755 "$APP_DIR/images" "$APP_DIR/uploads"
success "Dossiers créés"

# ─── 5. .env backend (créé seulement si absent) ───────────────────────────────
if [ ! -f "$APP_DIR/backend/.env" ]; then
  log "Création .env production..."
  JWT=$(openssl rand -hex 64)
  cat > "$APP_DIR/backend/.env" <<EOF
NODE_ENV=production
PORT=$APP_PORT
JWT_SECRET=$JWT
FRONTEND_URL=https://$DOMAIN

# ── CampPay (optionnel) ──────────────────────────────────────────────────────
# CAMPAY_APP_USERNAME=
# CAMPAY_APP_PASSWORD=
# CAMPAY_BASE_URL=https://app.campay.net/api
# CAMPAY_WEBHOOK_SECRET=

# ── Google OAuth (optionnel) ─────────────────────────────────────────────────
# GOOGLE_CLIENT_ID=
EOF
  warn ".env créé avec JWT aléatoire — ajoutez vos clés API manuellement si besoin"
  warn "Fichier: $APP_DIR/backend/.env"
else
  success ".env existant conservé"
fi

# ─── 6. Dépendances backend ───────────────────────────────────────────────────
log "Dépendances backend..."
cd "$APP_DIR/backend"
npm install --omit=dev --silent
success "npm install OK"

# ─── 7. Base de données ──────────────────────────────────────────────────────
log "Base de données..."
if [ ! -f "$APP_DIR/backend/db/saim.db" ]; then
  node server.js &
  sleep 3
  kill %1 2>/dev/null || true
  success "BDD initialisée (via server.js)"
else
  success "BDD existante conservée"
fi

# ─── 8. Nginx ────────────────────────────────────────────────────────────────
log "Configuration Nginx..."
cat > /etc/nginx/sites-available/saim <<NGINX
# ── SAIM AI — Nginx ──────────────────────────────────────────────────────────

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    # SSL (Let's Encrypt)
    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling        on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Upload & body
    client_max_body_size 100M;
    client_body_timeout  60s;

    # Gzip compression
    gzip             on;
    gzip_vary        on;
    gzip_proxied     any;
    gzip_comp_level  6;
    gzip_min_length  1000;
    gzip_types
        text/plain text/css text/xml text/javascript
        application/json application/javascript application/xml
        application/x-font-ttf font/woff font/woff2
        image/svg+xml;

    # ── Assets Vite (JS/CSS hashés → servis DIRECTEMENT, cache 1 an) ────────
    location /assets/ {
        root $APP_DIR/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files \$uri =404;
    }

    # ── Images statiques (/images/) → servis DIRECTEMENT depuis disque ───────
    location /images/ {
        root $APP_DIR;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
        try_files \$uri =404;
    }

    # ── Uploads (/uploads/) → servis DIRECTEMENT depuis disque ──────────────
    location /uploads/ {
        root $APP_DIR;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
        try_files \$uri =404;
    }

    # ── API → Node.js ─────────────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        add_header Cache-Control "no-store";
    }

    # ── SPA React (index.html + routes React Router) ─────────────────────────
    location / {
        root $APP_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-store";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/saim /etc/nginx/sites-enabled/saim
rm -f /etc/nginx/sites-enabled/default
nginx -t || error "Config Nginx invalide"
success "Nginx configuré"

# ─── 9. Firewall ─────────────────────────────────────────────────────────────
log "Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
success "UFW actif (SSH + HTTP/S)"

# ─── 10. SSL Let's Encrypt ───────────────────────────────────────────────────
log "SSL Let's Encrypt..."
systemctl reload nginx
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$SSL_EMAIL" \
    || warn "Certbot échoué — exécutez manuellement: certbot --nginx -d $DOMAIN"
  systemctl reload nginx
  success "Certificat SSL créé"
else
  success "Certificat SSL déjà existant"
fi

# Renouvellement auto
systemctl enable certbot.timer 2>/dev/null || \
  (crontab -l 2>/dev/null; echo "0 3 * * 0 certbot renew --quiet && nginx -s reload") | crontab -

# ─── 11. Démarrage PM2 ───────────────────────────────────────────────────────
log "Démarrage PM2..."
cd "$APP_DIR/backend"
pm2 delete saim-app 2>/dev/null || true
NODE_ENV=production pm2 start server.js \
  --name "saim-app" \
  --max-memory-restart 400M \
  --log /var/log/saim.log \
  --time
pm2 save
success "Application démarrée avec PM2"

# ─── 12. Santé ───────────────────────────────────────────────────────────────
sleep 4
if curl -sf http://localhost:$APP_PORT/api/health | grep -q '"status":"ok"'; then
  success "API opérationnelle"
else
  warn "API ne répond pas encore — vérifiez: pm2 logs saim-app"
fi

# ─── Résumé ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${G}╔══════════════════════════════════════════════╗${NC}"
echo -e "${G}║  ✓ INSTALLATION TERMINÉE                     ║${NC}"
echo -e "${G}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  Site     → https://$DOMAIN"
echo "  API      → https://$DOMAIN/api/health"
echo ""
echo "  Commandes utiles :"
echo "    pm2 logs saim-app          # Logs live"
echo "    pm2 restart saim-app       # Redémarrer"
echo "    pm2 monit                  # Monitoring"
echo "    certbot renew --dry-run    # Tester renouvellement SSL"
echo ""
echo "  .env backend → $APP_DIR/backend/.env"
echo "  BDD SQLite  → $APP_DIR/backend/db/saim.db"
echo ""
pm2 status
