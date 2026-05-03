# 🚀 Deployment Guide - All Platforms

This guide covers deploying your Email Admin System to various platforms.

---

## 📋 Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Heroku Deployment](#heroku-deployment)
3. [Render.com Deployment](#rendercom-deployment)
4. [DigitalOcean VPS](#digitalocean-vps)
5. [AWS Deployment](#aws-deployment)
6. [Vercel + Railway](#vercel--railway)

---

## 🐳 Docker Deployment

**Easiest way to deploy anywhere!**

### Prerequisites:
- Docker installed
- Docker Compose installed

### Steps:

```bash
# 1. Clone/navigate to project
cd email-admin-system

# 2. Create environment file
cp backend/.env.example .env

# 3. Edit .env with your settings
nano .env

# 4. Start with Docker Compose
docker-compose up -d

# 5. Check status
docker-compose ps

# 6. View logs
docker-compose logs -f

# Access at: http://localhost:3000
```

### Stop/Restart:
```bash
docker-compose down          # Stop
docker-compose restart       # Restart
docker-compose up -d --build # Rebuild and restart
```

---

## 🟣 Heroku Deployment

**Free tier available, very easy!**

### Backend Deployment:

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create your-email-admin-api

# 4. Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32)
heroku config:set ADMIN_EMAIL=admin@yourdomain.com
heroku config:set ADMIN_PASSWORD=YourStrongPassword123

# 5. Add buildpack
heroku buildpacks:set heroku/nodejs

# 6. Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku master

# 7. Get your API URL
heroku info
# Note the "Web URL" - this is your backend URL
```

### Frontend Deployment (Netlify):

```bash
# 1. Build frontend pointing to Heroku backend
cd frontend
echo "REACT_APP_API_URL=https://your-email-admin-api.herokuapp.com/api" > .env
npm install
npm run build

# 2. Deploy to Netlify
# Option A: Drag and drop 'build' folder to netlify.com/drop

# Option B: Use Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

**Cost:** Free tier available (limited hours/month)

---

## 🟢 Render.com Deployment

**Modern, free tier, very simple!**

### Backend:

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Name:** email-admin-api
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free

5. Add Environment Variables:
   ```
   JWT_SECRET=your_random_secret
   ENCRYPTION_KEY=your_random_key
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourPassword123
   ```

6. Click "Create Web Service"

### Frontend:

1. Click "New +" → "Static Site"
2. Connect same GitHub repo
3. Settings:
   - **Name:** email-admin-frontend
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`

4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-email-admin-api.onrender.com/api
   ```

5. Click "Create Static Site"

**Cost:** Free tier available

---

## 💧 DigitalOcean VPS

**$5/month, full control**

### One-Click Deployment:

```bash
# 1. Create a Droplet (Ubuntu 20.04)
# From DigitalOcean dashboard

# 2. SSH into your server
ssh root@your-server-ip

# 3. Clone your repository
git clone https://github.com/yourusername/email-admin-system.git
cd email-admin-system

# 4. Copy files from your local machine
# Or upload via SFTP

# 5. Run deployment script
chmod +x deploy-vps.sh
./deploy-vps.sh

# Follow prompts - script will:
# - Install Node.js
# - Install PM2
# - Install Nginx
# - Configure everything
# - Setup SSL (optional)
```

### Manual Deployment:

```bash
# 1. SSH into server
ssh root@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Install PM2
npm install -g pm2

# 4. Clone/upload project
git clone https://github.com/yourusername/email-admin-system.git
cd email-admin-system

# 5. Setup backend
cd backend
npm install --production
cp .env.example .env
nano .env  # Edit with your settings

pm2 start server.js --name email-admin-api
pm2 save
pm2 startup

# 6. Setup frontend
cd ../frontend
npm install
npm run build

# 7. Install and configure Nginx
apt install nginx -y

cat > /etc/nginx/sites-available/email-admin << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /root/email-admin-system/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/email-admin /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 8. Setup SSL with Let's Encrypt
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

**Cost:** $5-10/month

---

## ☁️ AWS Deployment

**EC2 + S3 deployment**

### Backend (EC2):

```bash
# 1. Launch EC2 instance (Ubuntu 20.04, t2.micro)

# 2. SSH into instance
ssh -i your-key.pem ubuntu@ec2-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone and setup
git clone https://github.com/yourusername/email-admin-system.git
cd email-admin-system/backend
npm install
cp .env.example .env
nano .env

# 5. Install PM2 and start
sudo npm install -g pm2
pm2 start server.js --name email-admin-api
pm2 startup
pm2 save

# 6. Configure security group to allow:
# - Port 22 (SSH)
# - Port 5000 (API)
# - Port 80 (HTTP)
# - Port 443 (HTTPS)
```

### Frontend (S3 + CloudFront):

```bash
# 1. Build frontend
cd frontend
echo "REACT_APP_API_URL=http://your-ec2-ip:5000/api" > .env
npm install
npm run build

# 2. Create S3 bucket
aws s3 mb s3://your-email-admin-frontend

# 3. Upload build
aws s3 sync build/ s3://your-email-admin-frontend

# 4. Enable static website hosting
aws s3 website s3://your-email-admin-frontend --index-document index.html

# 5. Make bucket public (optional - use CloudFront for security)

# 6. Setup CloudFront distribution pointing to S3
```

**Cost:** $5-15/month (EC2 t2.micro + S3)

---

## 🔷 Vercel + Railway

**Modern serverless deployment**

### Backend (Railway):

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. Add Variables:
   ```
   JWT_SECRET=random_secret
   ENCRYPTION_KEY=random_key
   ADMIN_EMAIL=admin@localhost
   ADMIN_PASSWORD=Password123
   ```

6. Deploy → Get railway app URL

### Frontend (Vercel):

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to frontend
cd frontend

# 3. Update API URL
echo "REACT_APP_API_URL=https://your-app.railway.app/api" > .env

# 4. Deploy
vercel

# Follow prompts
# Vercel will automatically detect React and configure
```

**Cost:** Free tier available

---

## 🔒 Post-Deployment Security

**For ALL deployments:**

### 1. Change Default Credentials
```bash
# In .env file:
ADMIN_EMAIL=your_secure_email@domain.com
ADMIN_PASSWORD=VeryStrongPassword123!
```

### 2. Setup HTTPS (SSL)

**For VPS (DigitalOcean, AWS EC2):**
```bash
sudo certbot --nginx -d your-domain.com
```

**For Heroku:**
- Automatic on custom domains

**For Render/Railway:**
- Automatic on all deployments

### 3. Environment Variables

**Never commit:**
- `.env` files
- Database files
- API keys

**Always use:**
- Strong random secrets (32+ characters)
- Different keys for each environment

### 4. Firewall Rules

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 5. Regular Backups

```bash
# Setup daily backup cron job
crontab -e

# Add:
0 2 * * * /path/to/email-admin-system/backup.sh backup
```

---

## 🎯 Quick Comparison

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Docker** | Depends on host | Easy | Any VPS/Cloud |
| **Heroku** | Free-$7/mo | Very Easy | Quick start |
| **Render** | Free-$7/mo | Very Easy | Modern apps |
| **DigitalOcean** | $5/mo | Medium | Full control |
| **AWS** | $5-15/mo | Hard | Scalability |
| **Vercel+Railway** | Free-$5/mo | Easy | Serverless |

---

## 🆘 Troubleshooting

### "Cannot connect to backend"
- Check backend URL in frontend `.env`
- Ensure backend is running
- Check CORS settings
- Verify firewall allows connections

### "Database locked" error
- Stop all instances
- Delete database.sqlite
- Restart server (will recreate)

### PM2 not starting on reboot
```bash
pm2 startup
pm2 save
```

### Nginx errors
```bash
nginx -t              # Test config
systemctl status nginx
journalctl -u nginx -f  # View logs
```

---

## 📞 Need Help?

Check the main [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

**Common Issues:**
- Backend connection: Check API URL
- Gmail not working: Use App Password
- Database issues: Backup and recreate
- Permission errors: Check file ownership

---

**Congratulations! 🎉**

Your Email Admin System is now deployed and accessible worldwide!
