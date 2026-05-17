# DevDay AI - Production Deployment Guide

## 🎯 Overview

This guide covers deploying DevDay AI to production environments with best practices for security, scalability, and reliability.

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] Generate strong JWT secret (256+ bits)
- [ ] Configure HTTPS/TLS certificates
- [ ] Set up environment-specific secrets management
- [ ] Review and restrict CORS origins
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up VPN/private network access if needed
- [ ] Enable database SSL connections
- [ ] Review and update security headers

### Infrastructure
- [ ] Provision production database (PostgreSQL)
- [ ] Set up container registry (Docker Hub, AWS ECR, etc.)
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up backup and disaster recovery
- [ ] Configure auto-scaling policies
- [ ] Set up load balancer

### Application
- [ ] Update environment variables for production
- [ ] Configure production database connection
- [ ] Set up health check endpoints
- [ ] Configure logging levels
- [ ] Review and optimize database indexes
- [ ] Test database migrations
- [ ] Configure connection pooling
- [ ] Set up CDN for static assets

---

## 🏗️ Architecture Options

### Option 1: Cloud Platform (Recommended)

**Backend:**
- AWS Elastic Beanstalk / Azure App Service / Google Cloud Run
- Managed PostgreSQL (AWS RDS / Azure Database / Google Cloud SQL)
- Application Load Balancer

**Frontend:**
- Vercel / Netlify / AWS Amplify
- CDN for static assets
- Edge functions for API routes

**Benefits:**
- Managed infrastructure
- Auto-scaling
- Built-in monitoring
- Easy deployment

### Option 2: Kubernetes

**Components:**
- Backend deployment (Spring Boot)
- Frontend deployment (Next.js)
- PostgreSQL StatefulSet or managed service
- Ingress controller (NGINX)
- Cert-manager for TLS

**Benefits:**
- Full control
- Multi-cloud portability
- Advanced orchestration
- Cost-effective at scale

### Option 3: Docker Compose (Small Scale)

**Components:**
- Backend container
- Frontend container
- PostgreSQL container
- NGINX reverse proxy
- Let's Encrypt for TLS

**Benefits:**
- Simple setup
- Low cost
- Good for small teams
- Easy to understand

---

## 🔧 Backend Production Setup

### 1. Build Production JAR

```bash
cd Backend

# Clean and build
mvn clean package -DskipTests

# JAR will be in target/devday-ai-backend-1.0.0.jar
```

### 2. Create Production Dockerfile

```dockerfile
# Backend/Dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR
COPY target/devday-ai-backend-*.jar app.jar

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
```

### 3. Production Environment Variables

```bash
# Database
DB_USERNAME=prod_user
DB_PASSWORD=<strong-password>
DATABASE_URL=jdbc:postgresql://prod-db.example.com:5432/devday_ai

# JWT (CRITICAL: Generate new secret!)
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Application
SPRING_PROFILES_ACTIVE=prod
PORT=8080

# CORS (Restrict to your domain)
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com

# Logging
LOG_LEVEL=INFO
SQL_LOG_LEVEL=WARN

# Monitoring
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics
```

### 4. Production application.yml

Create `Backend/src/main/resources/application-prod.yml`:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
  
  jpa:
    show-sql: false
    properties:
      hibernate:
        format_sql: false
        use_sql_comments: false
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    validate-on-migrate: true

server:
  port: ${PORT:8080}
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/xml,text/plain
  error:
    include-message: never
    include-binding-errors: never
    include-stacktrace: never
    include-exception: false

logging:
  level:
    root: INFO
    com.devday: INFO
    org.springframework.web: WARN
    org.springframework.security: WARN
    org.hibernate.SQL: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

### 5. Database Setup

```sql
-- Create production database
CREATE DATABASE devday_ai;

-- Create production user
CREATE USER prod_user WITH ENCRYPTED PASSWORD 'strong-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE devday_ai TO prod_user;

-- Enable SSL (recommended)
ALTER SYSTEM SET ssl = on;
```

---

## 🌐 Frontend Production Setup

### 1. Build Production Bundle

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Test production build locally
npm start
```

### 2. Environment Variables

Create `frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 4. Deploy to Custom Server

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

Update `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable for Docker
};

export default nextConfig;
```

---

## 🐳 Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: devday-postgres-prod
    environment:
      POSTGRES_DB: devday_ai
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - devday-network
    restart: unless-stopped
    command: postgres -c ssl=on -c ssl_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem -c ssl_key_file=/etc/ssl/private/ssl-cert-snakeoil.key

  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: devday-backend-prod
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DATABASE_URL: jdbc:postgresql://postgres:5432/devday_ai
      JWT_SECRET: ${JWT_SECRET}
      CORS_ALLOWED_ORIGINS: ${FRONTEND_URL}
    depends_on:
      - postgres
    networks:
      - devday-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: devday-frontend-prod
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - backend
    networks:
      - devday-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: devday-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - devday-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  devday-network:
    driver: bridge
```

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## ☸️ Kubernetes Deployment

### 1. Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devday-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: devday-backend
  template:
    metadata:
      labels:
        app: devday-backend
    spec:
      containers:
      - name: backend
        image: your-registry/devday-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: devday-secrets
              key: db-username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: devday-secrets
              key: db-password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: devday-secrets
              key: jwt-secret
        - name: DATABASE_URL
          value: "jdbc:postgresql://postgres-service:5432/devday_ai"
        livenessProbe:
          httpGet:
            path: /api/actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: devday-backend-service
spec:
  selector:
    app: devday-backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### 2. Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devday-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: devday-frontend
  template:
    metadata:
      labels:
        app: devday-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/devday-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.yourdomain.com/api"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: devday-frontend-service
spec:
  selector:
    app: devday-frontend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

### 3. Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devday-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - yourdomain.com
    - api.yourdomain.com
    secretName: devday-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: devday-frontend-service
            port:
              number: 3000
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: devday-backend-service
            port:
              number: 8080
```

---

## 📊 Monitoring and Observability

### 1. Application Metrics

Add to `Backend/pom.xml`:

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Update `application-prod.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### 2. Logging

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  elasticsearch_data:
```

### 3. Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/api/actuator/health

# Frontend health (add to Next.js)
curl https://yourdomain.com/api/health
```

---

## 🔒 Security Hardening

### 1. Environment Variables Security

```bash
# Use secrets management
# AWS Secrets Manager
# Azure Key Vault
# Google Secret Manager
# HashiCorp Vault

# Example with AWS CLI
aws secretsmanager create-secret \
  --name devday-ai/jwt-secret \
  --secret-string "your-jwt-secret"
```

### 2. Database Security

```sql
-- Create read-only user for monitoring
CREATE USER monitoring WITH PASSWORD 'monitoring-password';
GRANT CONNECT ON DATABASE devday_ai TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;

-- Enable row-level security (if needed)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_tasks ON tasks FOR ALL TO app_user USING (user_id = current_user_id());
```

### 3. Network Security

```yaml
# Security groups / firewall rules
# Backend: Only accept connections from load balancer
# Database: Only accept connections from backend
# Frontend: Only serve HTTPS

# Example AWS Security Group rules
Inbound:
  - Port 443 (HTTPS): 0.0.0.0/0
  - Port 8080 (Backend): Load Balancer Security Group
  - Port 5432 (Database): Backend Security Group

Outbound:
  - All traffic: 0.0.0.0/0 (for external API calls)
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Test Backend
      run: |
        cd Backend
        mvn test
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Test Frontend
      run: |
        cd frontend
        npm ci
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and Push Backend
      run: |
        docker build -t ${{ secrets.REGISTRY }}/devday-backend:${{ github.sha }} Backend/
        docker push ${{ secrets.REGISTRY }}/devday-backend:${{ github.sha }}
    
    - name: Build and Push Frontend
      run: |
        docker build -t ${{ secrets.REGISTRY }}/devday-frontend:${{ github.sha }} frontend/
        docker push ${{ secrets.REGISTRY }}/devday-frontend:${{ github.sha }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/devday-backend backend=${{ secrets.REGISTRY }}/devday-backend:${{ github.sha }}
        kubectl set image deployment/devday-frontend frontend=${{ secrets.REGISTRY }}/devday-frontend:${{ github.sha }}
```

---

## 📈 Performance Optimization

### Backend Optimizations

```yaml
# application-prod.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000

  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
        batch_versioned_data: true

server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    connection-timeout: 20000
    max-connections: 8192
```

### Database Optimizations

```sql
-- Add indexes for common queries
CREATE INDEX idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX idx_focus_sessions_user_id_status ON focus_sessions(user_id, status);
CREATE INDEX idx_work_logs_user_id_created_at ON work_logs(user_id, created_at);
CREATE INDEX idx_blockers_user_id_resolved ON blockers(user_id, resolved);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 1 AND status = 'TODO';
```

### Frontend Optimizations

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),
};
```

---

## 🔄 Backup and Disaster Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="devday_ai"

# Create backup
pg_dump -h localhost -U postgres $DB_NAME | gzip > $BACKUP_DIR/devday_ai_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "devday_ai_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/devday_ai_$DATE.sql.gz s3://your-backup-bucket/database/
```

### Application Backup

```bash
# Backup application data
kubectl create backup devday-backup --include-namespaces=devday-ai

# Restore from backup
kubectl restore devday-restore --from-backup=devday-backup
```

---

## 📞 Support and Maintenance

### Monitoring Checklist

- [ ] Application health checks
- [ ] Database performance metrics
- [ ] Error rate monitoring
- [ ] Response time monitoring
- [ ] Resource utilization (CPU, memory, disk)
- [ ] Log aggregation and alerting
- [ ] Security scanning
- [ ] Dependency vulnerability scanning

### Maintenance Tasks

- [ ] Regular security updates
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Log rotation and cleanup
- [ ] Certificate renewal
- [ ] Backup verification
- [ ] Performance optimization
- [ ] Capacity planning

---

**Made with Bob 🤖**