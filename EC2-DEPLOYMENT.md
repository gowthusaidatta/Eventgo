# EC2 Ubuntu Deployment Guide

## Prerequisites
- EC2 instance running Ubuntu 22.04
- Security group allows ports 80, 443, and 22
- SSH access to the instance

## Step 1: Connect to EC2 Instance
```bash
ssh -i /path/to/key.pem ubuntu@your_ec2_ip
```

## Step 2: Install Docker and Docker Compose
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (optional, for non-sudo docker commands)
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt-get install -y docker-compose
```

## Step 3: Clone or Upload Project
```bash
# Option A: Clone from Git (if using Git repository)
git clone https://github.com/your-repo/datta-eventgo.git
cd datta-eventgo

# Option B: Upload via SCP
scp -r -i /path/to/key.pem ./datta-eventgo ubuntu@your_ec2_ip:/home/ubuntu/
ssh -i /path/to/key.pem ubuntu@your_ec2_ip
cd datta-eventgo
```

## Step 4: Configure Environment Variables
```bash
# Create .env file with your Supabase credentials
nano .env.production
```

Add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

## Step 5: Build Docker Image
```bash
# Build the Docker image
docker-compose build

# Or build manually
docker build -t eventgo:latest .
```

## Step 6: Start the Container
```bash
# Start using docker-compose
sudo docker-compose up -d

# Or start manually
sudo docker run -d \
  --name eventgo-prod \
  -p 80:80 \
  -p 443:443 \
  --restart always \
  eventgo:latest
```

## Step 7: Verify Deployment
```bash
# Check if container is running
docker ps

# View logs
docker logs -f eventgo-production

# Check if website is accessible
curl http://localhost
```

## Step 8: Setup HTTPS with Let's Encrypt (Optional but Recommended)
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your_domain.com

# After getting certificate, update nginx.conf with:
# ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

# Restart container
docker-compose restart
```

## Step 9: Setup Auto-Renewal for SSL (if using Let's Encrypt)
```bash
# Create renewal script
sudo nano /usr/local/bin/renew-ssl.sh
```

Add the following:
```bash
#!/bin/bash
certbot renew
docker-compose -f /home/ubuntu/datta-eventgo/docker-compose.yml restart
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab for monthly renewal
sudo crontab -e
# Add this line:
# 0 2 1 * * /usr/local/bin/renew-ssl.sh
```

## Step 10: Monitor and Maintain
```bash
# View container status
docker-compose ps

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart the application
docker-compose restart

# Update and rebuild
git pull
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Container exits immediately
```bash
# Check logs
docker logs eventgo-production
```

### Port 80 already in use
```bash
# Find process using port 80
sudo lsof -i :80
# Kill the process
sudo kill -9 <PID>
```

### Permission denied errors
```bash
# Use sudo for docker commands or add user to docker group
sudo usermod -aG docker ubuntu
# Log out and log back in
```

### Check resource usage
```bash
docker stats eventgo-production
```

## Access Points
- HTTP: `http://your_ec2_ip`
- HTTPS: `https://your_domain.com` (after SSL setup)

## Performance Tips
1. Use Elastic IP to maintain static IP address
2. Use CloudWatch for monitoring
3. Setup CloudFront CDN for static assets
4. Use RDS for database if scaling
5. Monitor EC2 CPU, memory, and network metrics

## Security Checklist
- [ ] SSH key stored securely
- [ ] Security group restricts access appropriately
- [ ] HTTPS/SSL configured
- [ ] Environment variables are secure (not in git)
- [ ] Firewall rules configured
- [ ] Regular backups enabled
- [ ] Docker images updated regularly
