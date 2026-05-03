#!/bin/bash

# Email Admin System - One-Click Deployment Script
# For Ubuntu 20.04+ VPS

set -e

echo "🚀 Starting Email Admin System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Running as root${NC}"

# Update system
echo -e "${YELLOW}Updating system...${NC}"
apt update && apt upgrade -y

# Install Node.js 18
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"
echo -e "${GREEN}✓ npm $(npm --version) installed${NC}"

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
apt install -y nginx

# Create app directory
APP_DIR="/var/www/email-admin-system"
mkdir -p $APP_DIR
cd $APP_DIR

# Download/clone the system (assuming it's in current directory)
echo -e "${YELLOW}Setting up application...${NC}"

# Get user input for configuration
echo ""
echo "📝 Configuration Setup"
echo "====================="
read -p "Enter admin email (default: admin@localhost): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@localhost}

read -sp "Enter admin password (default: Admin@123456): " ADMIN_PASSWORD
echo ""
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin@123456}

# Generate random secrets
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Setup Backend
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
DB_PATH=./database.sqlite
EOF

npm install --production
pm2 start server.js --name email-admin-api
pm2 save
pm2 startup

echo -e "${GREEN}✓ Backend started on port 5000${NC}"

# Setup Frontend
echo -e "${YELLOW}Setting up frontend...${NC}"
cd ../frontend

# Update API URL
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

npm install
npm run build

echo -e "${GREEN}✓ Frontend built${NC}"

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"

# Get domain name
read -p "Enter your domain name (or press Enter for IP-based access): " DOMAIN_NAME
SERVER_NAME=${DOMAIN_NAME:-_}

cat > /etc/nginx/sites-available/email-admin << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    # Frontend
    location / {
        root $APP_DIR/frontend/build;
        try_files \$uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/email-admin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# Setup SSL if domain provided
if [ ! -z "$DOMAIN_NAME" ]; then
    read -p "Do you want to setup SSL/HTTPS with Let's Encrypt? (y/n): " SETUP_SSL
    if [ "$SETUP_SSL" = "y" ]; then
        echo -e "${YELLOW}Setting up SSL...${NC}"
        apt install -y certbot python3-certbot-nginx
        certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email $ADMIN_EMAIL
        echo -e "${GREEN}✓ SSL configured${NC}"
    fi
fi

# Setup firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

# Print summary
echo ""
echo "======================================"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo "======================================"
echo ""
echo "🌐 Access your system at:"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "   https://$DOMAIN_NAME"
else
    echo "   http://$(curl -s ifconfig.me)"
fi
echo ""
echo "🔐 Admin Login:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "📊 Useful Commands:"
echo "   pm2 status          - Check backend status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart backend"
echo "   nginx -t            - Test nginx config"
echo "   systemctl status nginx - Check nginx status"
echo ""
echo "📁 Files located at: $APP_DIR"
echo "🗄️  Database: $APP_DIR/backend/database.sqlite"
echo ""
echo "⚠️  IMPORTANT: Save these credentials securely!"
echo "======================================"
