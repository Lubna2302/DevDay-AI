# DevDay AI Backend Service Testing Script
# This script tests all authentication endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DevDay AI Backend Service Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$testsPassed = 0
$testsFailed = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "Get",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.ContentType = "application/json"
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ PASSED" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)`n" -ForegroundColor Gray
        $script:testsPassed++
        return $response
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n--- Test 1: Health Check ---" -ForegroundColor Cyan
Test-Endpoint -Name "Health Endpoint" -Url "$baseUrl/api/health"

# Test 2: Register New User
Write-Host "`n--- Test 2: User Registration ---" -ForegroundColor Cyan
$registerBody = @{
    email = "testuser_$(Get-Random)@example.com"
    name = "Test User"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Test-Endpoint `
    -Name "Register New User" `
    -Url "$baseUrl/auth/register" `
    -Method "Post" `
    -Body $registerBody

if ($registerResponse) {
    $token = $registerResponse.data.token
    $userEmail = $registerResponse.data.user.email
    Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Test 3: Get Current User Profile
    Write-Host "`n--- Test 3: Get User Profile ---" -ForegroundColor Cyan
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    Test-Endpoint `
        -Name "Get Current User" `
        -Url "$baseUrl/users/me" `
        -Headers $headers
    
    # Test 4: Login with Same User
    Write-Host "`n--- Test 4: User Login ---" -ForegroundColor Cyan
    $loginBody = @{
        email = $userEmail
        password = "password123"
    } | ConvertTo-Json
    
    Test-Endpoint `
        -Name "Login Existing User" `
        -Url "$baseUrl/auth/login" `
        -Method "Post" `
        -Body $loginBody
}

# Test 5: Invalid Login
Write-Host "`n--- Test 5: Invalid Login (Expected to Fail) ---" -ForegroundColor Cyan
$invalidLoginBody = @{
    email = "nonexistent@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

Write-Host "Testing: Invalid Login Credentials" -ForegroundColor Yellow
try {
    Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method "Post" `
        -ContentType "application/json" `
        -Body $invalidLoginBody
    Write-Host "✗ FAILED - Should have returned error" -ForegroundColor Red
    $script:testsFailed++
}
catch {
    Write-Host "✓ PASSED - Correctly rejected invalid credentials" -ForegroundColor Green
    $script:testsPassed++
}

# Test 6: Unauthorized Access
Write-Host "`n--- Test 6: Unauthorized Access (Expected to Fail) ---" -ForegroundColor Cyan
Write-Host "Testing: Access without token" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/users/me" -Method "Get"
    Write-Host "✗ FAILED - Should have returned 401" -ForegroundColor Red
    $script:testsFailed++
}
catch {
    Write-Host "✓ PASSED - Correctly rejected unauthorized access" -ForegroundColor Green
    $script:testsPassed++
}

# Test 7: Duplicate Email Registration
Write-Host "`n--- Test 7: Duplicate Email (Expected to Fail) ---" -ForegroundColor Cyan
$duplicateEmail = "duplicate_$(Get-Random)@example.com"
$duplicateBody = @{
    email = $duplicateEmail
    name = "First User"
    password = "password123"
} | ConvertTo-Json

# First registration
$firstReg = Test-Endpoint `
    -Name "First Registration" `
    -Url "$baseUrl/auth/register" `
    -Method "Post" `
    -Body $duplicateBody

if ($firstReg) {
    # Second registration with same email
    Write-Host "Testing: Duplicate Email Registration" -ForegroundColor Yellow
    try {
        Invoke-RestMethod `
            -Uri "$baseUrl/auth/register" `
            -Method "Post" `
            -ContentType "application/json" `
            -Body $duplicateBody
        Write-Host "✗ FAILED - Should have rejected duplicate email" -ForegroundColor Red
        $script:testsFailed++
    }
    catch {
        Write-Host "✓ PASSED - Correctly rejected duplicate email" -ForegroundColor Green
        $script:testsPassed++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White

if ($testsFailed -eq 0) {
    Write-Host "`n✓ All tests passed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n✗ Some tests failed. Please check the output above." -ForegroundColor Red
    exit 1
}

# Made with Bob
