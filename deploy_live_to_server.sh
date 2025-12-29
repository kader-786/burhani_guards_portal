cd ~/Projects/burhani_guards_portal_live

cat > deploy_live_to_server.sh << 'EOFSCRIPT'
#!/bin/bash

# Burhani Guards Portal - LIVE Deployment Script
# Deploys LIVE frontend to server

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================="
echo "  Burhani Guards Portal - LIVE Deploy"
echo "=========================================${NC}"
echo ""

# Configuration
SERVER_USER="ubuntu"
SERVER_IP="13.204.161.209"
PEM_KEY="$HOME/.ssh/burhani-guards.pem"  # Update this path!
REMOTE_PATH="/home/ubuntu/frontends/burhani_guards_live"
LOCAL_DIST="dist/"
BACKUP_PATH="/home/ubuntu/backups/portal_live"

# Check if PEM key exists
if [ ! -f "$PEM_KEY" ]; then
    echo -e "${RED}Error: PEM key not found at: $PEM_KEY${NC}"
    echo "Please update the PEM_KEY variable in this script"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "$LOCAL_DIST" ]; then
    echo -e "${RED}Error: dist/ folder not found!${NC}"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo -e "${YELLOW}⚠  DEPLOYING TO LIVE ENVIRONMENT ⚠${NC}"
echo ""
read -p "Are you sure you want to deploy to LIVE? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi
echo ""

echo -e "${GREEN}Step 1: Creating backup on server...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ssh -i "$PEM_KEY" ${SERVER_USER}@${SERVER_IP} << ENDSSH
if [ -d "$REMOTE_PATH/dist" ] && [ "\$(ls -A $REMOTE_PATH/dist 2>/dev/null)" ]; then
    cd $REMOTE_PATH
    tar -czf $BACKUP_PATH/backup_${TIMESTAMP}.tar.gz dist/
    echo "  ✓ Backup created: backup_${TIMESTAMP}.tar.gz"
    
    # Keep only last 10 backups
    cd $BACKUP_PATH
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm --
else
    echo "  ⚠ No existing files to backup (first deployment)"
fi
ENDSSH

echo -e "${GREEN}Step 2: Deploying to server...${NC}"
echo "  Source: $LOCAL_DIST"
echo "  Target: ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/dist/"

rsync -avz --delete \
    -e "ssh -i $PEM_KEY" \
    ${LOCAL_DIST} \
    ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/dist/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Files uploaded successfully${NC}"
else
    echo -e "${RED}  ✗ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Step 3: Verifying deployment...${NC}"
sleep 2

# Test if index.html exists
ssh -i "$PEM_KEY" ${SERVER_USER}@${SERVER_IP} "test -f $REMOTE_PATH/dist/index.html"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ index.html found${NC}"
else
    echo -e "${RED}  ✗ index.html not found!${NC}"
    exit 1
fi

# Test HTTP endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:8080/BURHANI_GUARDS/ 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}  ✓ LIVE frontend accessible (HTTP 200)${NC}"
else
    echo -e "${YELLOW}  ⚠ LIVE frontend returned HTTP $HTTP_CODE${NC}"
fi

echo ""
echo -e "${BLUE}========================================="
echo "  LIVE Deployment Complete! 🎉"
echo "=========================================${NC}"
echo ""
echo -e "${GREEN}LIVE Frontend URL:${NC}"
echo "  http://13.204.161.209:8080/BURHANI_GUARDS/"
echo ""
echo -e "${BLUE}Backup location:${NC}"
echo "  ${BACKUP_PATH}/backup_${TIMESTAMP}.tar.gz"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open http://13.204.161.209:8080/BURHANI_GUARDS/ in browser"
echo "  2. Test all functionality"
echo "  3. Check browser console for errors"
echo ""
EOFSCRIPT

chmod +x deploy_live_to_server.sh