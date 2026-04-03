#!/bin/bash
# ─── SAIM — Déploiement depuis le Mac vers VPS ───────────────────────────────
# Premier déploiement  : ./deploy.sh --setup
# Mise à jour simple   : ./deploy.sh

VPS_IP="148.230.120.31"
VPS_USER="root"
VPS_DIR="/var/www/mysaim"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

SETUP_MODE=false
if [ "$1" = "--setup" ]; then
  SETUP_MODE=true
fi

echo ""
echo "════════════════════════════════════════════════"
echo "  SAIM - Deploiement vers $VPS_IP"
if [ "$SETUP_MODE" = true ]; then
  echo "  Mode : PREMIER DEPLOIEMENT"
else
  echo "  Mode : MISE A JOUR"
fi
echo "════════════════════════════════════════════════"
echo ""

# ─── Build frontend local ─────────────────────────────────────────────────────
echo "Build du frontend..."
cd "$LOCAL_DIR/frontend"
npm install --silent
npm run build
cd "$LOCAL_DIR"
echo "  Build OK"

# ─── Créer le dossier sur le VPS ──────────────────────────────────────────────
echo "Creation du dossier sur le VPS..."
ssh "$VPS_USER@$VPS_IP" "mkdir -p $VPS_DIR"

# ─── Synchroniser les fichiers ────────────────────────────────────────────────
echo "Envoi des fichiers vers le VPS (entrez votre passphrase)..."
rsync -az --progress \
  --exclude 'node_modules' \
  --exclude 'frontend/node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'backend/db/saim.db' \
  --exclude 'backend/db/saim.db-shm' \
  --exclude 'backend/db/saim.db-wal' \
  --exclude 'backend/.env' \
  "$LOCAL_DIR/" \
  "$VPS_USER@$VPS_IP:$VPS_DIR/"
echo "  Fichiers envoyes"

# ─── Setup complet ou simple redémarrage ──────────────────────────────────────
if [ "$SETUP_MODE" = true ]; then
  echo ""
  echo "Lancement du setup VPS complet..."
  ssh "$VPS_USER@$VPS_IP" "bash $VPS_DIR/setup-vps.sh"
else
  echo ""
  echo "Mise a jour et redemarrage..."
  ssh "$VPS_USER@$VPS_IP" "cd $VPS_DIR/backend && npm install --omit=dev --silent && pm2 restart saim-app && pm2 status"
fi

echo ""
echo "════════════════════════════════════════════════"
echo "  DEPLOIEMENT TERMINE"
echo "  http://course.mysaim.com"
echo "════════════════════════════════════════════════"
echo ""
