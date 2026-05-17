#!/bin/bash

# Test Authentication APIs
BASE_URL="http://localhost:8080/api"

echo "=== Testing DevDay AI Authentication APIs ==="
echo ""

# Test 1: Register a new user
echo "1. Testing POST /auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@devday.ai",
    "name": "Demo Developer",
    "password": "demo123"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Test 2: Login with the same user
echo "2. Testing POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@devday.ai",
    "password": "demo123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Test 3: Get current user profile
echo "3. Testing GET /users/me (with JWT token)"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $USER_RESPONSE"
echo ""

# Test 4: Try to access without token (should fail)
echo "4. Testing GET /users/me (without token - should fail)"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me")

echo "Response: $UNAUTHORIZED_RESPONSE"
echo ""

echo "=== Tests Complete ==="

# Made with Bob
