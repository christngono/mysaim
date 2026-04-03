#!/bin/bash
# ─── SAIM — Setup automatique VPS Ubuntu 24.04 ───────────────────────────────

DOMAIN="course.mysaim.com"
APP_DIR="/var/www/mysaim"
APP_PORT="5001"

echo ""
echo "════════════════════════════════════════════════"
echo "  SAIM — Installation VPS"
echo "  Domaine : $DOMAIN"
echo "  Dossier : $APP_DIR"
echo "════════════════════════════════════════════════"
echo ""

# ─── 1. Mise à jour système ───────────────────────────────────────────────────
echo "[1/10] Mise à jour du systeme..."
apt-get update -qq
apt-get upgrade -y -qq
echo "  OK"

# ─── 2. Installer les outils ─────────────────────────────────────────────────
echo "[2/10] Installation des outils..."
apt-get install -y -qq curl git unzip nginx certbot python3-certbot-nginx ufw
echo "  OK"

# ─── 3. Vérifier/Installer Node.js 20 ────────────────────────────────────────
echo "[3/10] Verification Node.js..."
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt "18" ]; then
  echo "  Installation Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "  Node.js $(node -v) OK"

# ─── 4. Installer PM2 ────────────────────────────────────────────────────────
echo "[4/10] Installation PM2..."
npm install -g pm2 --quiet
PM2_BIN=$(which pm2)
env PATH=$PATH:$(dirname $PM2_BIN) $PM2_BIN startup systemd -u root --hp /root || true
echo "  PM2 OK"

# ─── 5. Installer dépendances backend ────────────────────────────────────────
echo "[5/10] Installation dependances backend..."
cd "$APP_DIR/backend"
npm install --omit=dev
echo "  OK"

# ─── 6. Build frontend ───────────────────────────────────────────────────────
echo "[6/10] Build du frontend React..."
cd "$APP_DIR/frontend"
npm install
npm run build
echo "  OK"

# ─── 7. Initialiser la base de données ───────────────────────────────────────
echo "[7/10] Base de donnees..."
cd "$APP_DIR/backend"
if [ ! -f "db/saim.db" ]; then
  node seed.js
  node add_quiz_module2.js
  node add_exercise_module2.js
  echo "  Base creee et seedee"
else
  echo "  Base existante conservee"
fi

# ─── 8. Créer le fichier .env ─────────────────────────────────────────────────
echo "[8/10] Configuration .env..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
  JWT=$(openssl rand -hex 32)
  printf "NODE_ENV=production\nPORT=%s\nJWT_SECRET=%s\nFRONTEND_URL=https://%s\n" \
    "$APP_PORT" "$JWT" "$DOMAIN" > "$APP_DIR/backend/.env"
  echo "  .env cree"
else
  echo "  .env existant conserve"
fi

# ─── 9. Configurer Nginx ─────────────────────────────────────────────────────
echo "[9/10] Configuration Nginx..."
cat > /etc/nginx/sites-available/saim << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/saim /etc/nginx/sites-enabled/saim
rm -f /etc/nginx/sites-enabled/default
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
nginx -t && systemctl reload nginx
echo "  Nginx OK"

# ─── 10. Démarrer avec PM2 ───────────────────────────────────────────────────
echo "[10/10] Demarrage de l'application..."
cd "$APP_DIR/backend"
pm2 delete saim-app 2>/dev/null || true
NODE_ENV=production pm2 start server.js --name "saim-app"
pm2 save
echo "  Application demarree"

# ─── Résumé ───────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  INSTALLATION TERMINEE !"
echo ""
echo "  Site accessible : http://$DOMAIN"
echo ""
pm2 status
echo ""
echo "  PROCHAINE ETAPE - Active le SSL :"
echo "  certbot --nginx -d $DOMAIN"
echo "════════════════════════════════════════════════"
echo ""
