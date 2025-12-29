#!/bin/bash

# Burhani Guards Portal - TEST Deployment Script
# Deploys TEST frontend to server using SCP

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================="
echo "  Burhani Guards Portal - TEST Deploy"
echo "=========================================${NC}"
echo ""

# Configuration
SERVER_USER="ubuntu"
SERVER_IP="13.204.161.209"
PEM_KEY="$HOME/Downloads/LinuxServer.pem"
REMOTE_PATH="/home/ubuntu/frontends/burhani_guards_test"
LOCAL_DIST="dist"
BACKUP_PATH="/home/ubuntu/backups/portal_test"

# Check if PEM key exists
if [ ! -f "$PEM_KEY" ]; then
    echo -e "${RED}Error: PEM key not found at: $PEM_KEY${NC}"
    echo "Please update the PEM_KEY variable in this script"
    echo "Current location checked: $PEM_KEY"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "$LOCAL_DIST" ]; then
    echo -e "${RED}Error: dist/ folder not found!${NC}"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo -e "${GREEN}Step 1: Creating backup on server...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ssh -o StrictHostKeyChecking=no -i "$PEM_KEY" ${SERVER_USER}@${SERVER_IP} << ENDSSH
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

echo -e "${GREEN}Step 2: Removing old files from server...${NC}"
ssh -o StrictHostKeyChecking=no -i "$PEM_KEY" ${SERVER_USER}@${SERVER_IP} "rm -rf $REMOTE_PATH/dist/*"
echo "  ✓ Old files removed"

echo -e "${GREEN}Step 3: Uploading new files to server...${NC}"
echo "  Source: $LOCAL_DIST/"
echo "  Target: ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/dist/"

# Use scp to upload files (recursive, preserves permissions)
scp -o StrictHostKeyChecking=no -i "$PEM_KEY" -r ${LOCAL_DIST}/* ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/dist/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Files uploaded successfully${NC}"
else
    echo -e "${RED}  ✗ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Step 4: Verifying deployment...${NC}"
sleep 2

# Test if index.html exists
ssh -o StrictHostKeyChecking=no -i "$PEM_KEY" ${SERVER_USER}@${SERVER_IP} "test -f $REMOTE_PATH/dist/index.html"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ index.html found${NC}"
else
    echo -e "${RED}  ✗ index.html not found!${NC}"
    exit 1
fi

# Count uploaded files
FILE_COUNT=$(ssh -o StrictHostKeyChecking=no -i "$PEM_KEY" ${SERVER_USER}@${SERVER_IP} "find $REMOTE_PATH/dist -type f | wc -l")
echo -e "${GREEN}  ✓ Total files deployed: $FILE_COUNT${NC}"

# Test HTTP endpoint
echo -e "${GREEN}Step 5: Testing HTTP endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:8080/BURHANI_GUARDS_TEST/ 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}  ✓ TEST frontend accessible (HTTP 200)${NC}"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${YELLOW}  ⚠ Redirect detected (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}  ⚠ TEST frontend returned HTTP $HTTP_CODE${NC}"
    echo -e "${YELLOW}  This might be normal for first deployment${NC}"
fi

echo ""
echo -e "${BLUE}========================================="
echo "  TEST Deployment Complete! 🎉"
echo "=========================================${NC}"
echo ""
echo -e "${GREEN}TEST Frontend URL:${NC}"
echo "  http://13.204.161.209:8080/BURHANI_GUARDS_TEST/"
echo ""
echo -e "${BLUE}Deployment Stats:${NC}"
echo "  Files deployed: $FILE_COUNT"
echo "  Backup: ${BACKUP_PATH}/backup_${TIMESTAMP}.tar.gz"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open http://13.204.161.209:8080/BURHANI_GUARDS_TEST/ in browser"
echo "  2. Test navigation and functionality"
echo "  3. Check browser console (F12) for errors"
echo "  4. Verify API calls work"
echo ""
