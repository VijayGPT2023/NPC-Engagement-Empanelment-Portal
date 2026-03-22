# Deployment Guide
## NPC Contractual Engagement & Empanelment Portal
### Version 1.0 | March 2026

---

## Part A: Railway (Staging)

Railway is used as the staging environment for development and testing.

---

### A.1 Prerequisites

- A Railway account (https://railway.app)
- GitHub repository connected to Railway
- The `.env.example` file for reference

---

### A.2 Services to Create

Create a new Railway project with three services:

1. **PostgreSQL** -- Database
2. **Redis** -- Cache (optional but recommended)
3. **Web** -- The Next.js application

---

### A.3 Step-by-Step Setup

#### Step 1: Create PostgreSQL Service

1. In your Railway project, click "New Service" > "Database" > "PostgreSQL"
2. Railway auto-provisions a PostgreSQL 16 instance
3. Note the `DATABASE_URL` from the service's "Connect" tab
   - Format: `postgresql://postgres:{password}@{host}:{port}/{db}`

#### Step 2: Create Redis Service

1. Click "New Service" > "Database" > "Redis"
2. Note the `REDIS_URL` from the "Connect" tab
   - Format: `redis://default:{password}@{host}:{port}`

#### Step 3: Deploy the Web Service

1. Click "New Service" > "GitHub Repo" > Select the repository
2. Railway auto-detects the Dockerfile and builds

#### Step 4: Configure Environment Variables

In the Web service settings, add these variables:

**REQUIRED:**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway reference variable) |
| `TOKEN_SECRET` | Generate with `openssl rand -base64 64` -- min 32 chars |
| `UPLOAD_DIR` | `/app/uploads` |
| `STORAGE_TYPE` | `local` |
| `PORT` | `3000` |

**OPTIONAL (for full functionality):**

| Variable | Value |
|----------|-------|
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `SMTP_HOST` | Your SMTP host for email |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMS_PROVIDER` | `console` (staging does not send real SMS) |
| `APP_URL` | `https://{your-railway-domain}` |

#### Step 5: Volume Setup for Uploads

1. In the Web service, go to "Settings" > "Volumes"
2. Add a volume:
   - Mount path: `/app/uploads`
   - Name: `uploads`
3. This persists uploaded files across deploys

#### Step 6: Database Seeding

After the first deploy succeeds:

```bash
# Connect to Railway's shell (from Railway CLI or dashboard terminal)
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

Or via the Railway dashboard terminal:
```bash
npx prisma migrate deploy
npx prisma db seed
```

This creates the database schema and seeds the initial admin user.

#### Step 7: Health Check Verification

```bash
curl https://{your-railway-domain}/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-19T10:00:00.000Z",
  "version": "0.1.0",
  "uptime": 120.5
}
```

---

### A.4 Common Railway Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails with Prisma error | Missing `DATABASE_URL` at build time | Add a dummy `DATABASE_URL` to build env or use Prisma generate without DB |
| 503 on health check | Database not ready | Wait for PostgreSQL to be fully provisioned; check DATABASE_URL reference |
| Uploads lost on redeploy | No volume mounted | Attach a persistent volume to `/app/uploads` |
| `process.exit(1)` on start | TOKEN_SECRET not set or weak | Set TOKEN_SECRET to a strong value (min 32 chars) |
| Rate limiting too aggressive | Shared IP behind Railway proxy | Ensure `x-forwarded-for` header is passed correctly |
| Build timeout | Large `node_modules` | Ensure `.dockerignore` excludes `node_modules`, `.next`, `uploads` |

---

## Part B: NICSI VM (Production)

### B.1 Prerequisites

- **Server**: Ubuntu 22.04+ LTS (or RHEL 8+ / Rocky Linux 9)
- **Docker**: 24.0+ with Docker Compose v2
- **Nginx**: 1.24+ (as reverse proxy)
- **Domain**: Assigned domain (e.g., `engagement.npcindia.gov.in`)
- **SSL Certificate**: From NIC CA or Let's Encrypt
- **Network**: Port 80/443 open; outbound access for SMTP and SMS APIs

### B.2 Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB | 100 GB (for uploads) |
| OS Disk | 20 GB | 40 GB |

---

### B.3 Step-by-Step Deployment

#### Step 1: Clone Repository

```bash
cd /opt
git clone https://github.com/your-org/Contractual-engagement-portal.git
cd Contractual-engagement-portal/portal
```

#### Step 2: Configure Environment

```bash
cp .env.example .env
nano .env
```

Fill in all REQUIRED variables:

```bash
# ─── CORE ───────────────────────────────────────────
NODE_ENV=production
PORT=3000

# ─── DATABASE ───────────────────────────────────────
DATABASE_URL=postgresql://npc:YOUR_STRONG_PASSWORD@postgres:5432/npc_portal

# ─── AUTHENTICATION ────────────────────────────────
TOKEN_SECRET=YOUR_64_CHAR_RANDOM_SECRET
# Generate: openssl rand -base64 64

# ─── FILE STORAGE ──────────────────────────────────
STORAGE_TYPE=minio
UPLOAD_DIR=/app/uploads
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=YOUR_MINIO_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_MINIO_SECRET_KEY
MINIO_BUCKET=npc-portal

# ─── EMAIL (NIC SMTP) ─────────────────────────────
SMTP_HOST=smtp.nic.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=portal@npcindia.gov.in
SMTP_PASS=YOUR_SMTP_PASSWORD
SMTP_FROM=noreply@npcindia.gov.in

# ─── SMS ────────────────────────────────────────────
SMS_PROVIDER=nic_gateway
NIC_SMS_API_URL=https://smsgw.nic.in/api/send
NIC_SMS_USERNAME=YOUR_USERNAME
NIC_SMS_PASSWORD=YOUR_PASSWORD
NIC_SMS_SENDER_ID=NPCIND

# ─── DEPLOYMENT ─────────────────────────────────────
APP_URL=https://engagement.npcindia.gov.in
```

#### Step 3: Start with Docker Compose

```bash
docker compose up -d
```

This starts:
- `app` -- Next.js application on port 3000
- `postgres` -- PostgreSQL 16 on port 5432
- `redis` -- Redis 7 on port 6379
- `mailhog` -- (Optional) Mail testing on port 8025

Verify all containers are running:
```bash
docker compose ps
```

#### Step 4: Run Database Migrations

```bash
docker compose exec app npx prisma migrate deploy
```

#### Step 5: Seed Admin Users

```bash
docker compose exec app npx prisma db seed
```

This creates the initial admin user. Default credentials are defined in the seed script.

**Important**: Change the default admin password immediately after first login.

#### Step 6: Configure Nginx Reverse Proxy

Create the Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/npc-portal
```

```nginx
# Rate limiting zone (10MB shared memory, 10 req/sec per IP)
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Upstream to Docker container
upstream npc_portal {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name engagement.npcindia.gov.in;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name engagement.npcindia.gov.in;

    # SSL Certificates (NIC CA or Let's Encrypt)
    ssl_certificate     /etc/ssl/certs/npc-portal.crt;
    ssl_certificate_key /etc/ssl/private/npc-portal.key;

    # SSL hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Request size limits
    client_max_body_size 10M;

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://npc_portal;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # File uploads (higher size limit)
    location /api/upload {
        client_max_body_size 10M;
        limit_req zone=api burst=5 nodelay;
        proxy_pass http://npc_portal;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Static assets and Next.js
    location / {
        proxy_pass http://npc_portal;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Cache static assets
    location /_next/static/ {
        proxy_pass http://npc_portal;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Health check (no rate limit)
    location /api/health {
        proxy_pass http://npc_portal;
        proxy_set_header Host $host;
    }
}
```

Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/npc-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Configure MinIO for File Storage

If using MinIO instead of local filesystem, add MinIO to docker-compose or use an existing MinIO instance.

Add to `docker-compose.yml` (or use a separate compose file):

```yaml
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: YOUR_MINIO_ACCESS_KEY
      MINIO_ROOT_PASSWORD: YOUR_MINIO_SECRET_KEY
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

Set `STORAGE_TYPE=minio` and configure the MINIO_* variables in `.env`.

The application auto-creates the bucket `npc-portal` if it does not exist.

#### Step 8: Configure SMTP (NIC Mail Server)

Contact NIC for SMTP credentials for the `npcindia.gov.in` domain. Typical NIC SMTP configuration:

```
SMTP_HOST=smtp.nic.in (or smtp.gov.in)
SMTP_PORT=587
SMTP_SECURE=false (STARTTLS used automatically)
SMTP_USER=portal@npcindia.gov.in
SMTP_PASS=<provided by NIC>
SMTP_FROM=noreply@npcindia.gov.in
```

Test email delivery:
```bash
docker compose exec app node -e "
  const { sendEmail } = require('./src/lib/email');
  sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' })
    .then(console.log)
    .catch(console.error);
"
```

#### Step 9: Configure SMS Gateway

For NIC SMS Gateway:
```
SMS_PROVIDER=nic_gateway
NIC_SMS_API_URL=https://smsgw.nic.in/api/send
NIC_SMS_USERNAME=<provided by NIC>
NIC_SMS_PASSWORD=<provided by NIC>
NIC_SMS_SENDER_ID=NPCIND
```

For MSG91 (alternative):
```
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=<your API key>
MSG91_SENDER_ID=NPCIND
MSG91_ROUTE=4
```

#### Step 10: Set Up Monitoring

**Health Check (cron):**

```bash
# Add to root crontab
sudo crontab -e
```

```
# Health check every 5 minutes, alert if unhealthy
*/5 * * * * curl -sf http://localhost:3000/api/health > /dev/null || echo "NPC Portal UNHEALTHY at $(date)" | mail -s "ALERT: NPC Portal Down" admin@npcindia.gov.in
```

**Log Collection:**

```bash
# View application logs
docker compose logs -f app

# Export logs to file for analysis
docker compose logs app --since 24h > /var/log/npc-portal/app-$(date +%Y%m%d).log
```

**Docker container monitoring:**

```bash
# Check resource usage
docker stats --no-stream
```

#### Step 11: Backup Strategy

**Database backup (daily cron):**

```bash
sudo mkdir -p /opt/backups/npc-portal
sudo crontab -e
```

```
# Daily database backup at 2 AM
0 2 * * * docker compose -f /opt/Contractual-engagement-portal/portal/docker-compose.yml exec -T postgres pg_dump -U npc npc_portal | gzip > /opt/backups/npc-portal/db_$(date +\%Y\%m\%d_\%H\%M).sql.gz

# Cleanup backups older than 30 days
0 3 * * * find /opt/backups/npc-portal -name "db_*.sql.gz" -mtime +30 -delete
```

**Upload directory backup (weekly):**

```bash
# Weekly uploads backup
0 3 * * 0 tar czf /opt/backups/npc-portal/uploads_$(date +\%Y\%m\%d).tar.gz -C /opt/Contractual-engagement-portal/portal uploads/
```

---

### B.4 SSL Certificate

#### Option A: NIC CA Certificate

Request an SSL certificate from NIC for your domain. Place the certificate files:
```
/etc/ssl/certs/npc-portal.crt      # Certificate + chain
/etc/ssl/private/npc-portal.key     # Private key
```

#### Option B: Let's Encrypt (if NIC CA not available)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d engagement.npcindia.gov.in
```

Certbot auto-renews certificates via a systemd timer.

---

### B.5 Backup and Restore Commands

**Manual database backup:**
```bash
docker compose exec -T postgres pg_dump -U npc npc_portal > backup.sql
```

**Restore from backup:**
```bash
docker compose exec -T postgres psql -U npc npc_portal < backup.sql
```

**Compressed backup and restore:**
```bash
# Backup
docker compose exec -T postgres pg_dump -U npc npc_portal | gzip > backup.sql.gz

# Restore
gunzip -c backup.sql.gz | docker compose exec -T postgres psql -U npc npc_portal
```

---

### B.6 Migration from Railway to NICSI

#### Step 1: Export Database from Railway

```bash
# Get Railway PostgreSQL credentials from dashboard
pg_dump -h <railway-host> -p <railway-port> -U postgres -d railway --no-owner --no-acls > railway_dump.sql
```

Or use Railway CLI:
```bash
railway run pg_dump $DATABASE_URL --no-owner --no-acls > railway_dump.sql
```

#### Step 2: Import into NICSI PostgreSQL

```bash
# Copy dump to NICSI server
scp railway_dump.sql user@nicsi-vm:/tmp/

# On NICSI server
docker compose exec -T postgres psql -U npc npc_portal < /tmp/railway_dump.sql
```

#### Step 3: Migrate Uploaded Files

```bash
# On Railway (or local machine with Railway volume access)
# Download uploads directory
railway run tar czf /tmp/uploads.tar.gz -C /app uploads

# Transfer to NICSI
scp uploads.tar.gz user@nicsi-vm:/tmp/

# On NICSI server
cd /opt/Contractual-engagement-portal/portal
tar xzf /tmp/uploads.tar.gz
```

If migrating from local storage to MinIO, upload files to MinIO after extraction.

#### Step 4: Update DNS

Point `engagement.npcindia.gov.in` to the NICSI VM IP address.

#### Step 5: Verify

```bash
curl -k https://engagement.npcindia.gov.in/api/health
```

---

### B.7 Updating the Application

```bash
cd /opt/Contractual-engagement-portal/portal

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose build app
docker compose up -d app

# Run any new migrations
docker compose exec app npx prisma migrate deploy

# Verify
curl http://localhost:3000/api/health
```

For zero-downtime updates, use a blue-green approach:
```bash
# Build new image without stopping current
docker compose build app

# Swap to new image
docker compose up -d --no-deps app
```
