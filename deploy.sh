#!/bin/bash
# ─── SAIM — Déploiement Mac → VPS ────────────────────────────────────────────
# Usage:
#   ./deploy.sh              → Mise à jour complète (build + sync + restart)
#   ./deploy.sh --setup      → Premier déploiement (initialise le VPS)
#   ./deploy.sh --no-build   → Mise à jour sans rebuild frontend
#   ./deploy.sh --rollback   → Restaure la dernière sauvegarde DB
#   ./deploy.sh --status     → Statut PM2 + santé API
#   ./deploy.sh --logs       → Logs live de l'application

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
VPS_IP="148.230.120.31"
VPS_USER="root"
VPS_DIR="/var/www/mysaim"
DOMAIN="course.mysaim.com"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DEPLOY_LOG="/tmp/saim-deploy-${TIMESTAMP}.log"

# ─── Couleurs ────────────────────────────────────────────────────────────────
R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m' B='\033[0;34m' C='\033[0;36m' NC='\033[0m'
log()     { echo -e "${B}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG"; }
success() { echo -e "${G}  ✓ $1${NC}" | tee -a "$DEPLOY_LOG"; }
error()   { echo -e "${R}  ✗ $1${NC}" | tee -a "$DEPLOY_LOG"; exit 1; }
warn()    { echo -e "${Y}  ⚠ $1${NC}" | tee -a "$DEPLOY_LOG"; }
step()    { echo -e "\n${C}▶ $1${NC}" | tee -a "$DEPLOY_LOG"; }

# ─── SSH helper ──────────────────────────────────────────────────────────────
vps() { ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$@"; }

# ─── 1. Connexion ────────────────────────────────────────────────────────────
check_connection() {
  step "Connexion VPS"
  if ! vps "exit" 2>/dev/null; then
    error "Impossible de joindre $VPS_IP. Vérifiez SSH et l'IP."
  fi
  success "Connecté à $VPS_IP"
}

# ─── 2. Vérif .env ───────────────────────────────────────────────────────────
check_envs() {
  step "Vérification des fichiers .env"
  local ok=true

  # Backend .env
  if [ ! -f "$LOCAL_DIR/backend/.env" ]; then
    warn "backend/.env introuvable — les variables d'env ne seront pas envoyées"
  else
    # Vérifier les variables critiques
    for var in JWT_SECRET; do
      if ! grep -q "^${var}=" "$LOCAL_DIR/backend/.env" 2>/dev/null; then
        warn "backend/.env : variable $var manquante"
        ok=false
      fi
    done
  fi

  # Frontend .env (pour le build)
  if [ ! -f "$LOCAL_DIR/frontend/.env" ] && [ ! -f "$LOCAL_DIR/frontend/.env.production" ]; then
    warn "frontend/.env introuvable (VITE_GOOGLE_CLIENT_ID non défini)"
  fi

  $ok && success ".env validés"
}

# ─── 3. Build frontend ───────────────────────────────────────────────────────
build_frontend() {
  step "Build frontend React (Vite)"
  cd "$LOCAL_DIR/frontend" || error "Dossier frontend introuvable"

  log "Installation dépendances npm..."
  npm ci --prefer-offline --silent 2>>"$DEPLOY_LOG" \
    || npm install --silent 2>>"$DEPLOY_LOG" \
    || error "npm install échoué"

  log "Compilation Vite..."
  npm run build 2>>"$DEPLOY_LOG" || error "Build Vite échoué — voir $DEPLOY_LOG"

  [ -d "dist" ] || error "Dossier dist absent après build"

  local dist_size
  dist_size=$(du -sh dist | cut -f1)
  success "Build terminé (dist: $dist_size)"
  cd "$LOCAL_DIR" || exit 1
}

# ─── 4. Sauvegarde BDD ───────────────────────────────────────────────────────
backup_db() {
  step "Sauvegarde base de données"
  vps "
    mkdir -p $VPS_DIR/backend/db/backups
    if [ -f $VPS_DIR/backend/db/saim.db ]; then
      cp $VPS_DIR/backend/db/saim.db $VPS_DIR/backend/db/backups/saim-${TIMESTAMP}.db
      # Garder seulement les 10 dernières sauvegardes
      ls -t $VPS_DIR/backend/db/backups/saim-*.db 2>/dev/null | tail -n +11 | xargs rm -f
      echo 'Sauvegarde créée: saim-${TIMESTAMP}.db'
    else
      echo 'Pas de BDD existante — premier déploiement'
    fi
  " | tee -a "$DEPLOY_LOG"
  success "BDD sauvegardée"
}

# ─── 5. Sync fichiers ────────────────────────────────────────────────────────
sync_code() {
  step "Synchronisation code → VPS"
  vps "mkdir -p $VPS_DIR"

  # Backend + assets (pas la BDD, pas le .env VPS)
  rsync -az --delete --compress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='backend/db/saim.db' \
    --exclude='backend/db/saim.db-shm' \
    --exclude='backend/db/saim.db-wal' \
    --exclude='backend/db/backups' \
    --exclude='backend/.env' \
    --exclude='frontend/node_modules' \
    --exclude='frontend/dist' \
    --exclude='frontend/.env*' \
    --progress \
    "$LOCAL_DIR/" \
    "$VPS_USER@$VPS_IP:$VPS_DIR/" 2>>"$DEPLOY_LOG" \
    || error "rsync code échoué"

  success "Code synchronisé"
}

sync_dist() {
  step "Envoi build frontend"

  # Transfert compressé du dist
  rsync -az --delete --compress \
    --progress \
    "$LOCAL_DIR/frontend/dist/" \
    "$VPS_USER@$VPS_IP:$VPS_DIR/frontend/dist/" 2>>"$DEPLOY_LOG" \
    || error "rsync dist échoué"

  success "Frontend dist transféré"
}

sync_uploads() {
  # Sync images/uploads locaux vers VPS (sens unique, sans suppression)
  if [ -d "$LOCAL_DIR/images" ] || [ -d "$LOCAL_DIR/uploads" ]; then
    step "Synchronisation médias (images/uploads)"
    rsync -az --compress \
      --exclude='.DS_Store' \
      "$LOCAL_DIR/images/" "$VPS_USER@$VPS_IP:$VPS_DIR/images/" 2>>"$DEPLOY_LOG" || true
    rsync -az --compress \
      --exclude='.DS_Store' \
      "$LOCAL_DIR/uploads/" "$VPS_USER@$VPS_IP:$VPS_DIR/uploads/" 2>>"$DEPLOY_LOG" || true
    success "Médias synchronisés"
  fi
}

# ─── 6. Redémarrage ──────────────────────────────────────────────────────────
restart_app() {
  step "Installation dépendances & redémarrage"

  vps "
    set -e
    cd $VPS_DIR/backend

    # Dépendances production uniquement
    npm install --omit=dev --silent 2>&1

    # Redémarrage gracieux PM2
    if pm2 describe saim-app > /dev/null 2>&1; then
      pm2 reload saim-app --update-env
    else
      NODE_ENV=production pm2 start server.js \
        --name saim-app \
        --max-memory-restart 400M \
        --log /var/log/saim.log \
        --time
      pm2 save
    fi
  " 2>>"$DEPLOY_LOG" || error "Redémarrage échoué — vérifiez: ssh root@$VPS_IP 'pm2 logs saim-app --lines 30'"

  success "Application redémarrée"
}

# ─── 7. Health check avec retries ────────────────────────────────────────────
health_check() {
  step "Vérification santé API"
  local url="https://${DOMAIN}/api/health"
  local ok=false

  for i in 1 2 3 4 5; do
    sleep 3
    local resp
    resp=$(curl -sf --max-time 8 "$url" 2>/dev/null || echo "")
    if echo "$resp" | grep -q '"status":"ok"'; then
      ok=true
      break
    fi
    log "Tentative $i/5 — en attente..."
  done

  if $ok; then
    success "API en bonne santé → $url"
  else
    warn "API ne répond pas après 5 tentatives. Vérifiez: ssh root@$VPS_IP 'pm2 logs saim-app --lines 50'"
  fi
}

# ─── 8. Mise à jour Nginx (config statique directe) ─────────────────────────
update_nginx() {
  step "Mise à jour config Nginx"

  vps "cat > /etc/nginx/sites-available/saim <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://\$host\$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;

    client_max_body_size 100M;
    gzip on; gzip_vary on; gzip_proxied any; gzip_comp_level 6; gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript image/svg+xml;

    # Vite assets (hashés) — cache permanent
    location /assets/ {
        root $VPS_DIR/frontend/dist;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
        access_log off;
        try_files \$uri =404;
    }

    # Images statiques — servies directement depuis disque
    location /images/ {
        root $VPS_DIR;
        expires 30d;
        add_header Cache-Control \"public\";
        access_log off;
        try_files \$uri =404;
    }

    # Uploads — servis directement depuis disque
    location /uploads/ {
        root $VPS_DIR;
        expires 30d;
        add_header Cache-Control \"public\";
        access_log off;
        try_files \$uri =404;
    }

    # API → Node.js
    location /api/ {
        proxy_pass         http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        add_header Cache-Control \"no-store\";
    }

    # SPA React
    location / {
        root $VPS_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        expires -1;
        add_header Cache-Control \"no-store\";
    }
}
NGINX
nginx -t && systemctl reload nginx && echo 'Nginx rechargé'"

  success "Nginx mis à jour — images/uploads servis directement depuis disque"
}

# ─── 9. Rollback ─────────────────────────────────────────────────────────────
rollback_db() {
  step "ROLLBACK base de données"
  local latest
  latest=$(vps "ls -t $VPS_DIR/backend/db/backups/saim-*.db 2>/dev/null | head -1")
  if [ -z "$latest" ]; then
    error "Aucune sauvegarde disponible"
  fi
  log "Restauration depuis: $latest"
  vps "
    pm2 stop saim-app || true
    cp $latest $VPS_DIR/backend/db/saim.db
    pm2 start saim-app
    echo 'Rollback terminé'
  " | tee -a "$DEPLOY_LOG"
  success "Rollback effectué depuis $latest"
}

# ─── Header / Footer ────────────────────────────────────────────────────────
header() {
  echo ""
  echo -e "${C}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${C}║     SAIM AI — Déploiement VPS                ║${NC}"
  echo -e "${C}║     $DOMAIN${NC}"
  echo -e "${C}╚══════════════════════════════════════════════╝${NC}"
  echo ""
}

footer() {
  echo ""
  echo -e "${G}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${G}║  ✓ DÉPLOIEMENT TERMINÉ                       ║${NC}"
  echo -e "${G}║  → https://$DOMAIN           ║${NC}"
  echo -e "${G}║  Log: $DEPLOY_LOG${NC}"
  echo -e "${G}╚══════════════════════════════════════════════╝${NC}"
  echo ""
}

# ─── Main ───────────────────────────────────────────────────────────────────
MODE="${1:---update}"
header

case "$MODE" in

  --setup)
    log "MODE : PREMIER DÉPLOIEMENT"
    check_connection
    check_envs
    build_frontend
    sync_code
    sync_dist
    sync_uploads
    vps "bash $VPS_DIR/setup-vps.sh"
    health_check
    footer
    ;;

  --no-build)
    log "MODE : MISE À JOUR (sans rebuild)"
    check_connection
    backup_db
    sync_code
    sync_uploads
    restart_app
    health_check
    footer
    ;;

  --nginx)
    check_connection
    update_nginx
    ;;

  --rollback)
    check_connection
    rollback_db
    health_check
    ;;

  --status)
    check_connection
    vps "pm2 status && echo '' && curl -sf http://localhost:5001/api/health && echo ''"
    ;;

  --logs)
    vps "pm2 logs saim-app --lines 50"
    ;;

  --update|*)
    log "MODE : MISE À JOUR COMPLÈTE"
    check_connection
    check_envs
    build_frontend
    backup_db
    sync_code
    sync_dist
    sync_uploads
    restart_app
    health_check
    footer
    ;;

esac

exit 0
