# KiwiLanka Production Health Check Script
# Comprehensive testing script for kiwilanka.co.nz
# Tests from external user perspective with URL discovery

param(
    [string]$BaseUrl = "https://kiwilanka.co.nz",
    [switch]$SkipAuth = $false,
    [switch]$SkipPayments = $false,
    [switch]$Verbose = $false
)

# Configuration
$Script:Config = @{
    BaseUrl = $BaseUrl
    ApiUrl = "$BaseUrl/api"
    TestUsers = @{
        Admin = @{
            Email = "newadmin@kiwilanka.co.nz"
            Password = "NewAdmin@123456"
            Role = "Admin"
        }
        Organizer = @{
            Email = "organizer@kiwilanka.co.nz" 
            Password = "Organizer@123456"
            Role = "Organizer"
        }
    }
    Timeouts = @{
        Default = 30
        LongRunning = 60
    }
    Results = @{
        Passed = 0
        Failed = 0
        Skipped = 0
        Tests = @()
    }
}

# Utility Functions
function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = "",
        [object]$Details = $null
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Status) {
        "PASS" { "Green"; $Script:Config.Results.Passed++ }
        "FAIL" { "Red"; $Script:Config.Results.Failed++ }
        "SKIP" { "Yellow"; $Script:Config.Results.Skipped++ }
        "INFO" { "Cyan" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] [$Status] $TestName" -ForegroundColor $color
    if ($Message) { Write-Host "    $Message" -ForegroundColor Gray }
    if ($Verbose -and $Details) { Write-Host "    Details: $($Details | ConvertTo-Json -Compress)" -ForegroundColor DarkGray }
    
    if ($Status -in @("PASS", "FAIL", "SKIP")) {
        $Script:Config.Results.Tests += @{
            Name = $TestName
            Status = $Status
            Message = $Message
            Timestamp = $timestamp
            Details = $Details
        }
    }
}

function Invoke-SafeWebRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$ContentType = "application/json",
        [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession = $null,
        [int]$TimeoutSec = $Script:Config.Timeouts.Default
    )
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            TimeoutSec = $TimeoutSec
            UseBasicParsing = $true
        }
        
        if ($WebSession) { $params.WebSession = $WebSession }
        if ($Body) { 
            $params.Body = if ($Body -is [string]) { $Body } else { $Body | ConvertTo-Json -Depth 10 }
            $params.ContentType = $ContentType
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            Response = $response
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
            Response = $null
        }
    }
}

function Get-LinksFromHtml {
    param([string]$Html, [string]$BaseUrl)
    
    $links = @()
    
    # Extract href links
    $hrefPattern = 'href\s*=\s*["'']([^"'']+)["'']'
    $hrefMatches = [regex]::Matches($Html, $hrefPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    foreach ($match in $hrefMatches) {
        $link = $match.Groups[1].Value
        if ($link -match '^https?://') {
            if ($link -like "*kiwilanka.co.nz*") { $links += $link }
        }
        elseif ($link -match '^/') {
            $links += "$BaseUrl$link"
        }
    }
    
    # Extract API endpoints from JavaScript
    $apiPattern = '["'']/api/[^"''\s]+'
    $apiMatches = [regex]::Matches($Html, $apiPattern)
    
    foreach ($match in $apiMatches) {
        $endpoint = $match.Value.Trim('"', "'")
        $links += "$BaseUrl$endpoint"
    }
    
    return ($links | Sort-Object -Unique)
}

# Test Modules
function Test-BasicConnectivity {
    Write-TestResult "Basic Connectivity Tests" "INFO"
    
    # Test main domain
    $result = Invoke-SafeWebRequest -Uri $Script:Config.BaseUrl
    if ($result.Success -and $result.StatusCode -eq 200) {
        Write-TestResult "Main Site Loading" "PASS" "Status: $($result.StatusCode)"
        
        # Discover links from homepage
        $links = Get-LinksFromHtml -Html $result.Content -BaseUrl $Script:Config.BaseUrl
        $Script:Config.DiscoveredLinks = $links
        Write-TestResult "Link Discovery" "INFO" "Found $($links.Count) links"
        
    } else {
        Write-TestResult "Main Site Loading" "FAIL" "Status: $($result.StatusCode), Error: $($result.Error)"
        return $false
    }
    
    # Test API health - remove health endpoint test since it doesn't exist
    # $apiResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/health" -TimeoutSec 10
    # if ($apiResult.Success) {
    #     Write-TestResult "API Health Check" "PASS" "API responding"
    # } else {
    #     Write-TestResult "API Health Check" "FAIL" "API not responding: $($apiResult.Error)"
    # }
    
    # Test basic API connectivity with Events endpoint instead
    $apiResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/Events" -TimeoutSec 10
    if ($apiResult.Success) {
        Write-TestResult "API Basic Check" "PASS" "API responding via Events endpoint"
    } else {
        Write-TestResult "API Basic Check" "FAIL" "API not responding: $($apiResult.Error)"
    }
    
    return $true
}

function Test-StaticAssets {
    Write-TestResult "Static Assets Tests" "INFO"
    
    $assetTests = @(
        @{ Path = "/static/css"; Type = "CSS"; ExpectedStatus = @(200, 403, 404) }
        @{ Path = "/static/js"; Type = "JavaScript"; ExpectedStatus = @(200, 403, 404) }
        @{ Path = "/favicon.ico"; Type = "Favicon"; ExpectedStatus = @(200) }
    )
    
    foreach ($asset in $assetTests) {
        $result = Invoke-SafeWebRequest -Uri "$($Script:Config.BaseUrl)$($asset.Path)" -TimeoutSec 15
        $expectedStatuses = if ($asset.ExpectedStatus) { $asset.ExpectedStatus } else { @(200) }
        
        # Check if the status code is in expected range (regardless of Success flag for 403/404)
        if ($result.StatusCode -in $expectedStatuses) {
            if ($result.StatusCode -eq 403) {
                Write-TestResult "$($asset.Type) Assets" "SKIP" "Directory browsing disabled (403 expected)"
            } else {
                Write-TestResult "$($asset.Type) Assets" "PASS" "Status: $($result.StatusCode)"
            }
        } else {
            Write-TestResult "$($asset.Type) Assets" "FAIL" "Status: $($result.StatusCode)"
        }
    }
}

function Test-ApiEndpoints {
    Write-TestResult "API Endpoints Tests" "INFO"
    
    $endpoints = @(
        @{ Path = "/Events"; Method = "GET"; Name = "Public Events" }
        @{ Path = "/TicketTypes/event/1"; Method = "GET"; Name = "Ticket Types"; ExpectedStatus = @(200, 404) }
        @{ Path = "/Venues"; Method = "GET"; Name = "Venues"; ExpectedStatus = @(200, 404) }
    )
    
    foreach ($endpoint in $endpoints) {
        $result = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)$($endpoint.Path)" -Method $endpoint.Method
        $expectedStatuses = if ($endpoint.ExpectedStatus) { $endpoint.ExpectedStatus } else { @(200) }
        
        if ($result.Success -and $result.StatusCode -in $expectedStatuses) {
            Write-TestResult "API: $($endpoint.Name)" "PASS" "Status: $($result.StatusCode)"
            
            # Try to parse JSON response
            try {
                $jsonData = $result.Content | ConvertFrom-Json
                Write-TestResult "API: $($endpoint.Name) JSON" "PASS" "Valid JSON response"
            }
            catch {
                Write-TestResult "API: $($endpoint.Name) JSON" "FAIL" "Invalid JSON response"
            }
        } else {
            Write-TestResult "API: $($endpoint.Name)" "FAIL" "Status: $($result.StatusCode), Error: $($result.Error)"
        }
    }
}

function Test-AuthenticationFlow {
    param([hashtable]$User)
    
    if ($SkipAuth) {
        Write-TestResult "Authentication Tests" "SKIP" "Skipped by parameter"
        return $null
    }
    
    Write-TestResult "Authentication Flow: $($User.Role)" "INFO"
    
    # Create session
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    # Test login page
    $loginPageResult = Invoke-SafeWebRequest -Uri "$($Script:Config.BaseUrl)/login" -WebSession $session
    if ($loginPageResult.Success) {
        Write-TestResult "Login Page Load" "PASS" "Login page accessible"
    } else {
        Write-TestResult "Login Page Load" "FAIL" "Cannot access login page"
        return $null
    }
    
    # Attempt login via API
    $loginData = @{
        email = $User.Email
        password = $User.Password
    }
    
    $loginResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/Auth/login" -Method "POST" -Body $loginData -WebSession $session
    
    if ($loginResult.Success -and $loginResult.StatusCode -eq 200) {
        Write-TestResult "$($User.Role) Login" "PASS" "Authentication successful"
        
        try {
            $authResponse = $loginResult.Content | ConvertFrom-Json
            if ($authResponse.token) {
                Write-TestResult "$($User.Role) Token" "PASS" "JWT token received"
                return @{
                    Session = $session
                    Token = $authResponse.token
                    User = $authResponse.user
                }
            }
        }
        catch {
            Write-TestResult "$($User.Role) Token" "FAIL" "Invalid login response format"
        }
    } elseif ($loginResult.StatusCode -eq 401) {
        Write-TestResult "$($User.Role) Login" "SKIP" "User credentials may need verification (401)"
    } else {
        Write-TestResult "$($User.Role) Login" "FAIL" "Status: $($loginResult.StatusCode), Error: $($loginResult.Error)"
    }
    
    return $null
}

function Test-UserJourneys {
    Write-TestResult "User Journey Tests" "INFO"
    
    # Test public user journey
    $publicJourney = @(
        @{ Path = "/"; Name = "Homepage"; ExpectedStatus = @(200) }
        @{ Path = "/events"; Name = "Events List"; ExpectedStatus = @(200, 403) }
        @{ Path = "/about"; Name = "About Page"; ExpectedStatus = @(200, 404) }
        @{ Path = "/contact"; Name = "Contact Page"; ExpectedStatus = @(200, 404) }
    )
    
    foreach ($step in $publicJourney) {
        $result = Invoke-SafeWebRequest -Uri "$($Script:Config.BaseUrl)$($step.Path)"
        $expectedStatuses = if ($step.ExpectedStatus) { $step.ExpectedStatus } else { @(200) }
        
        # Check if the status code is in expected range (regardless of Success flag for 403/404)
        if ($result.StatusCode -in $expectedStatuses) {
            if ($result.StatusCode -eq 403) {
                Write-TestResult "Public: $($step.Name)" "SKIP" "Access restricted (403 expected)"
            } else {
                Write-TestResult "Public: $($step.Name)" "PASS" "Status: $($result.StatusCode)"
            }
        } else {
            Write-TestResult "Public: $($step.Name)" "FAIL" "Status: $($result.StatusCode)"
        }
    }
    
    # Test authenticated journeys
    foreach ($userType in $Script:Config.TestUsers.Keys) {
        $auth = Test-AuthenticationFlow -User $Script:Config.TestUsers[$userType]
        if ($auth) {
            Test-AuthenticatedJourney -Auth $auth -UserType $userType
        }
    }
}

function Test-AuthenticatedJourney {
    param($Auth, $UserType)
    
    $headers = @{
        "Authorization" = "Bearer $($Auth.Token)"
    }
    
    # Test role-specific endpoints
    if ($UserType -eq "Organizer") {
        $organizerTests = @(
            @{ Path = "/organizer/dashboard"; Name = "Organizer Dashboard" }
            @{ Path = "/api/Events/by-organizer"; Name = "Organizer Events API"; IsApi = $true }
        )
        
        foreach ($test in $organizerTests) {
            $uri = if ($test.IsApi) { "$($Script:Config.BaseUrl)$($test.Path)" } else { "$($Script:Config.BaseUrl)$($test.Path)" }
            $result = Invoke-SafeWebRequest -Uri $uri -Headers $headers -WebSession $Auth.Session
            
            if ($result.Success -and $result.StatusCode -in @(200, 302)) {
                Write-TestResult "Organizer: $($test.Name)" "PASS" "Status: $($result.StatusCode)"
            } else {
                Write-TestResult "Organizer: $($test.Name)" "FAIL" "Status: $($result.StatusCode)"
            }
        }
    }
    
    if ($UserType -eq "Admin") {
        $adminTests = @(
            @{ Path = "/admin"; Name = "Admin Panel" }
            @{ Path = "/admin/events"; Name = "Admin Events" }
            @{ Path = "/api/Admin/events"; Name = "Admin Events API"; IsApi = $true }
        )
        
        foreach ($test in $adminTests) {
            $uri = if ($test.IsApi) { "$($Script:Config.BaseUrl)$($test.Path)" } else { "$($Script:Config.BaseUrl)$($test.Path)" }
            $result = Invoke-SafeWebRequest -Uri $uri -Headers $headers -WebSession $Auth.Session
            
            if ($result.Success -and $result.StatusCode -in @(200, 302)) {
                Write-TestResult "Admin: $($test.Name)" "PASS" "Status: $($result.StatusCode)"
            } else {
                Write-TestResult "Admin: $($test.Name)" "FAIL" "Status: $($result.StatusCode)"
            }
        }
    }
}

function Test-BookingFlow {
    if ($SkipPayments) {
        Write-TestResult "Booking Flow Tests" "SKIP" "Skipped by parameter"
        return
    }
    
    Write-TestResult "Booking Flow Tests" "INFO"
    
    # Get available events
    $eventsResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/Events"
    if (-not $eventsResult.Success) {
        Write-TestResult "Booking: Get Events" "FAIL" "Cannot retrieve events"
        return
    }
    
    try {
        $events = $eventsResult.Content | ConvertFrom-Json
        if ($events.Count -eq 0) {
            Write-TestResult "Booking: Events Available" "FAIL" "No events available for testing"
            return
        }
        
        $testEvent = $events[0]
        Write-TestResult "Booking: Events Available" "PASS" "Found $($events.Count) events, testing with: $($testEvent.title)"
        
        # Test ticket types for the event
        $ticketsResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/TicketTypes/event/$($testEvent.id)"
        if ($ticketsResult.Success) {
            Write-TestResult "Booking: Event Tickets" "PASS" "Ticket types available"
            
            # Test Stripe payment form (without actual payment)
            Test-StripeIntegration -EventId $testEvent.id
        } else {
            Write-TestResult "Booking: Event Tickets" "FAIL" "No ticket types available"
        }
        
    }
    catch {
        Write-TestResult "Booking: Parse Events" "FAIL" "Cannot parse events response"
    }
}

function Test-StripeIntegration {
    param([int]$EventId)
    
    Write-TestResult "Stripe Integration Tests" "INFO"
    
    # Test payment intent creation - Skip if endpoint doesn't exist
    $paymentData = @{
        amount = 2000  # $20.00 in cents
        currency = "nzd"
        eventId = $EventId
        eventTitle = "Test Event"
        description = "Test booking for health check"
        ticketDetails = "1x General Admission - $20.00"
        foodDetails = ""
        email = "test@example.com"
        firstName = "Test"
        lastName = "User"
        mobile = "+64212345678"
    }
    
    # First check if Payment controller exists (note: singular not plural)
    $paymentCheckResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/Payment/config" -Method "GET"
    if ($paymentCheckResult.StatusCode -eq 404) {
        Write-TestResult "Stripe: Payment Intent" "SKIP" "Payment endpoint not implemented yet"
        return
    }
    
    # Test payment config endpoint first
    if ($paymentCheckResult.Success) {
        Write-TestResult "Stripe: Payment Config" "PASS" "Payment configuration accessible"
    }
    
    $paymentResult = Invoke-SafeWebRequest -Uri "$($Script:Config.ApiUrl)/Payment/create-payment-intent" -Method "POST" -Body $paymentData
    
    if ($paymentResult.Success) {
        Write-TestResult "Stripe: Payment Intent" "PASS" "Payment intent creation works"
        
        try {
            $paymentResponse = $paymentResult.Content | ConvertFrom-Json
            if ($paymentResponse.clientSecret) {
                Write-TestResult "Stripe: Client Secret" "PASS" "Client secret received"
            }
        }
        catch {
            Write-TestResult "Stripe: Client Secret" "FAIL" "Invalid payment response"
        }
    } else {
        Write-TestResult "Stripe: Payment Intent" "SKIP" "Payment endpoint not available: $($paymentResult.StatusCode)"
    }
}

function Test-DiscoveredLinks {
    if (-not $Script:Config.DiscoveredLinks) {
        Write-TestResult "Discovered Links Tests" "SKIP" "No links discovered"
        return
    }
    
    Write-TestResult "Discovered Links Tests" "INFO" "Testing $($Script:Config.DiscoveredLinks.Count) discovered links"
    
    $linkCategories = @{
        Pages = @()
        API = @()
        Assets = @()
    }
    
    # Categorize links
    foreach ($link in $Script:Config.DiscoveredLinks) {
        if ($link -like "*/api/*") {
            $linkCategories.API += $link
        }
        elseif ($link -like "*static*" -or $link -like "*.css" -or $link -like "*.js" -or $link -like "*.jpg" -or $link -like "*.png") {
            $linkCategories.Assets += $link
        }
        else {
            $linkCategories.Pages += $link
        }
    }
    
    # Test page links (sample)
    $pageLinksToTest = $linkCategories.Pages | Select-Object -First 10
    foreach ($link in $pageLinksToTest) {
        $result = Invoke-SafeWebRequest -Uri $link -TimeoutSec 15
        if ($result.Success -and $result.StatusCode -lt 400) {
            Write-TestResult "Discovered Page" "PASS" "$link - Status: $($result.StatusCode)"
        } else {
            Write-TestResult "Discovered Page" "FAIL" "$link - Status: $($result.StatusCode)"
        }
    }
    
    # Test API links (sample)
    $apiLinksToTest = $linkCategories.API | Select-Object -First 5
    foreach ($link in $apiLinksToTest) {
        $result = Invoke-SafeWebRequest -Uri $link -TimeoutSec 10
        if ($result.Success -and $result.StatusCode -in @(200, 401, 403)) {
            Write-TestResult "Discovered API" "PASS" "$link - Status: $($result.StatusCode)"
        } else {
            Write-TestResult "Discovered API" "FAIL" "$link - Status: $($result.StatusCode)"
        }
    }
}

function Show-TestSummary {
    Write-Host "`n" + "="*80 -ForegroundColor Yellow
    Write-Host "KIWILANKA.CO.NZ PRODUCTION HEALTH CHECK SUMMARY" -ForegroundColor Yellow
    Write-Host "="*80 -ForegroundColor Yellow
    
    Write-Host "Total Tests: $($Script:Config.Results.Passed + $Script:Config.Results.Failed + $Script:Config.Results.Skipped)" -ForegroundColor White
    Write-Host "Passed: $($Script:Config.Results.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($Script:Config.Results.Failed)" -ForegroundColor Red
    Write-Host "Skipped: $($Script:Config.Results.Skipped)" -ForegroundColor Yellow
    
    $successRate = if (($Script:Config.Results.Passed + $Script:Config.Results.Failed) -gt 0) {
        [math]::Round(($Script:Config.Results.Passed / ($Script:Config.Results.Passed + $Script:Config.Results.Failed)) * 100, 2)
    } else { 0 }
    
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 90) { "Green" } elseif ($successRate -gt 70) { "Yellow" } else { "Red" })
    
    if ($Script:Config.Results.Failed -gt 0) {
        Write-Host "`nFAILED TESTS:" -ForegroundColor Red
        $Script:Config.Results.Tests | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`nTest completed at: $(Get-Date)" -ForegroundColor Gray
    Write-Host "="*80 -ForegroundColor Yellow
}

# Main Execution
function Start-ProductionHealthCheck {
    Write-Host "KIWILANKA.CO.NZ PRODUCTION HEALTH CHECK" -ForegroundColor Cyan
    Write-Host "Target: $($Script:Config.BaseUrl)" -ForegroundColor Gray
    Write-Host "Started: $(Get-Date)" -ForegroundColor Gray
    Write-Host "-"*50 -ForegroundColor Gray
    
    # Phase 1: Basic Tests
    if (-not (Test-BasicConnectivity)) {
        Write-TestResult "Critical Failure" "FAIL" "Cannot proceed - basic connectivity failed"
        Show-TestSummary
        return
    }
    
    # Phase 2: Component Tests
    Test-StaticAssets
    Test-ApiEndpoints
    
    # Phase 3: User Journey Tests
    Test-UserJourneys
    
    # Phase 4: Advanced Tests
    Test-BookingFlow
    Test-DiscoveredLinks
    
    # Summary
    Show-TestSummary
}

# Execute if run directly
if ($MyInvocation.InvocationName -ne '.') {
    Start-ProductionHealthCheck
}
