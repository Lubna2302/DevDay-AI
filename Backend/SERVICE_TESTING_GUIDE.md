# Service Testing Guide

This guide will help you test the DevDay AI Backend service running on localhost.

## Prerequisites

✅ PostgreSQL running (via Docker)
✅ Spring Boot application running on port 8080

## Quick Start

The application is now starting. Once you see "Started DevDayApplication" in the terminal, you can begin testing.

## Available Endpoints

### 1. Health Check
```bash
# Test if the service is running
curl http://localhost:8080/api/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-05-16T15:00:00.000Z"
}
```

### 2. Register New User
```bash
# Register a new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"name\":\"Demo User\",\"password\":\"password123\"}"
```

**Expected Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "demo@example.com",
      "name": "Demo User"
    }
  },
  "timestamp": "2026-05-16T15:00:00.000Z"
}
```

### 3. Login
```bash
# Login with existing user
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "demo@example.com",
      "name": "Demo User"
    }
  },
  "timestamp": "2026-05-16T15:00:00.000Z"
}
```

### 4. Get Current User Profile
```bash
# Get current user (requires JWT token from login/register)
# Replace YOUR_JWT_TOKEN with the actual token from login/register response

curl http://localhost:8080/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "data": {
    "id": 1,
    "email": "demo@example.com",
    "name": "Demo User"
  },
  "timestamp": "2026-05-16T15:00:00.000Z"
}
```

## PowerShell Testing Commands

If you prefer PowerShell, use these commands:

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
```

### Register User
```powershell
$body = @{
    email = "demo@example.com"
    name = "Demo User"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Login
```powershell
$body = @{
    email = "demo@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Save token for later use
$token = $response.data.token
Write-Host "Token: $token"
```

### Get Current User
```powershell
# Use the token from login
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/users/me" `
    -Method Get `
    -Headers $headers
```

## Complete Test Flow

Here's a complete test flow you can run:

```powershell
# 1. Check health
Write-Host "`n=== Testing Health Endpoint ===" -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get

# 2. Register a new user
Write-Host "`n=== Registering New User ===" -ForegroundColor Green
$registerBody = @{
    email = "testuser@example.com"
    name = "Test User"
    password = "securepass123"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody

Write-Host "User registered successfully!"
Write-Host "User ID: $($registerResponse.data.user.id)"
Write-Host "Email: $($registerResponse.data.user.email)"

# Save the token
$token = $registerResponse.data.token

# 3. Get current user profile
Write-Host "`n=== Getting User Profile ===" -ForegroundColor Green
$headers = @{
    Authorization = "Bearer $token"
}

$userProfile = Invoke-RestMethod -Uri "http://localhost:8080/users/me" `
    -Method Get `
    -Headers $headers

Write-Host "Profile retrieved successfully!"
Write-Host "Name: $($userProfile.data.name)"
Write-Host "Email: $($userProfile.data.email)"

# 4. Login with the same user
Write-Host "`n=== Testing Login ===" -ForegroundColor Green
$loginBody = @{
    email = "testuser@example.com"
    password = "securepass123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Login successful!"
Write-Host "New token received"

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Green
```

## Testing Error Cases

### Invalid Email Format
```powershell
$body = @{
    email = "invalid-email"
    name = "Test User"
    password = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8080/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
} catch {
    Write-Host "Expected error: Invalid email format" -ForegroundColor Yellow
    $_.Exception.Response
}
```

### Duplicate Email
```powershell
# Try to register the same email twice
$body = @{
    email = "duplicate@example.com"
    name = "User One"
    password = "password123"
} | ConvertTo-Json

# First registration (should succeed)
Invoke-RestMethod -Uri "http://localhost:8080/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Second registration (should fail)
try {
    Invoke-RestMethod -Uri "http://localhost:8080/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
} catch {
    Write-Host "Expected error: Email already registered" -ForegroundColor Yellow
}
```

### Invalid Credentials
```powershell
$body = @{
    email = "demo@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8080/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
} catch {
    Write-Host "Expected error: Invalid credentials" -ForegroundColor Yellow
}
```

### Unauthorized Access (No Token)
```powershell
try {
    Invoke-RestMethod -Uri "http://localhost:8080/users/me" -Method Get
} catch {
    Write-Host "Expected error: Unauthorized" -ForegroundColor Yellow
}
```

## Using Postman

You can also use Postman for testing:

1. **Import Collection**: Create a new collection called "DevDay AI Backend"

2. **Add Requests**:
   - Health Check: GET `http://localhost:8080/api/health`
   - Register: POST `http://localhost:8080/auth/register`
   - Login: POST `http://localhost:8080/auth/login`
   - Get Profile: GET `http://localhost:8080/users/me`

3. **Set Authorization**: For `/users/me`, add Bearer Token in Authorization tab

## Troubleshooting

### Application Not Starting
- Check if PostgreSQL is running: `docker compose ps`
- Check logs in the terminal
- Verify port 8080 is not in use

### Database Connection Issues
- Ensure Docker container is healthy
- Check `application.yml` for correct database credentials
- Verify PostgreSQL is accessible on port 5432

### JWT Token Issues
- Ensure you're using the token from the latest login/register
- Check token format: should start with "eyJ"
- Verify Authorization header format: `Bearer <token>`

## Next Steps

Once basic authentication is working, you can:
1. Test with multiple users
2. Verify token expiration (default: 24 hours)
3. Test concurrent requests
4. Monitor database for user records
5. Check application logs for any errors

## Database Verification

To verify users are being created in the database:

```powershell
# Connect to PostgreSQL
docker exec -it devday-postgres psql -U devday -d devday_db

# List all users
SELECT id, email, name, created_at FROM users;

# Exit
\q
```

---

**Made with Bob** 🤖