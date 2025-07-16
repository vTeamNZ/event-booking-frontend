# Complete Production Deployment Script
# Deploys both Frontend and Backend with Processing Fee functionality
# Date: 2025-07-17

param(
    [switch]$BackendOnly = $false,
    [switch]$FrontendOnly = $false,
    [string]$BackupPath = "C:\Backups\KiwiLanka",
    [string]$FrontendIISPath = "C:\inetpub\wwwroot\kiwilanka",
    [string]$BackendIISPath = "C:\inetpub\wwwroot\eventbooking-api"
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n=== $Message ===" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput $Message "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput $Message "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput $Message "Red"
}

try {
    Write-Step "Starting KiwiLanka Production Deployment with Processing Fees"
    Write-ColorOutput "Timestamp: $Timestamp" "Gray"

    # Deploy Backend API (if not frontend-only)
    if (!$FrontendOnly) {
        Write-Step "Deploying Backend API"
        
        $ApiPath = "c:\Users\gayantd\source\repos\vTeamNZ\EventBooking.API\EventBooking.API"
        $ApiPublishPath = "$ApiPath\publish\production"
        
        if (!(Test-Path $ApiPublishPath)) {
            throw "Backend publish directory not found: $ApiPublishPath. Please run dotnet publish first."
        }
        
        # Backup existing API
        if (Test-Path $BackendIISPath) {
            $ApiBackupDir = "$BackupPath\API_$Timestamp"
            Write-ColorOutput "Backing up API to: $ApiBackupDir" "Gray"
            if (!(Test-Path $BackupPath)) { New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null }
            Copy-Item -Path $BackendIISPath -Destination $ApiBackupDir -Recurse -Force
        }
        
        # Deploy API
        Write-ColorOutput "Deploying API to: $BackendIISPath" "Gray"
        if (Test-Path $BackendIISPath) {
            Remove-Item -Path "$BackendIISPath\*" -Recurse -Force
        } else {
            New-Item -ItemType Directory -Path $BackendIISPath -Force | Out-Null
        }
        Copy-Item -Path "$ApiPublishPath\*" -Destination $BackendIISPath -Recurse -Force
        
        Write-Success "✓ Backend API deployed successfully"
    }

    # Deploy Frontend (if not backend-only)
    if (!$BackendOnly) {
        Write-Step "Deploying Frontend"
        
        $FrontendPath = "c:\Users\gayantd\source\repos\vTeamNZ\event-booking-frontend"
        $FrontendBuildPath = "$FrontendPath\build"
        
        if (!(Test-Path $FrontendBuildPath)) {
            throw "Frontend build directory not found: $FrontendBuildPath. Please run npm run build first."
        }
        
        # Backup existing frontend
        if (Test-Path $FrontendIISPath) {
            $FrontendBackupDir = "$BackupPath\Frontend_$Timestamp"
            Write-ColorOutput "Backing up Frontend to: $FrontendBackupDir" "Gray"
            if (!(Test-Path $BackupPath)) { New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null }
            Copy-Item -Path $FrontendIISPath -Destination $FrontendBackupDir -Recurse -Force
        }
        
        # Deploy Frontend
        Write-ColorOutput "Deploying Frontend to: $FrontendIISPath" "Gray"
        if (Test-Path $FrontendIISPath) {
            Remove-Item -Path "$FrontendIISPath\*" -Recurse -Force
        } else {
            New-Item -ItemType Directory -Path $FrontendIISPath -Force | Out-Null
        }
        Copy-Item -Path "$FrontendBuildPath\*" -Destination $FrontendIISPath -Recurse -Force
        
        Write-Success "✓ Frontend deployed successfully"
    }

    # Final Summary
    Write-Step "Deployment Summary"
    Write-Success "🎉 KiwiLanka Production Deployment Completed!"
    
    if (!$FrontendOnly) {
        Write-ColorOutput "✓ Backend API deployed with processing fee functionality" "Green"
        Write-ColorOutput "  - ProcessingFeeService" "Gray"
        Write-ColorOutput "  - Updated PaymentController" "Gray"
        Write-ColorOutput "  - Processing fee calculation endpoints" "Gray"
    }
    
    if (!$BackendOnly) {
        Write-ColorOutput "✓ Frontend deployed with processing fee UI" "Green"
        Write-ColorOutput "  - Admin processing fee configuration" "Gray"
        Write-ColorOutput "  - Customer processing fee display" "Gray"
        Write-ColorOutput "  - Payment flow integration" "Gray"
    }
    
    Write-ColorOutput "`nBackup location: $BackupPath" "Yellow"
    
    Write-Step "Post-Deployment Verification"
    Write-Warning "Please verify the following:"
    Write-ColorOutput "1. Website loads: https://kiwilanka.co.nz" "Yellow"
    Write-ColorOutput "2. API responds: https://kiwilanka.co.nz/api/Events" "Yellow"
    Write-ColorOutput "3. Admin can configure processing fees" "Yellow"
    Write-ColorOutput "4. Customers see processing fee breakdown" "Yellow"
    Write-ColorOutput "5. Payment flow includes processing fees" "Yellow"
    
} catch {
    Write-Error "❌ Deployment failed: $_"
    Write-ColorOutput "Check the error details above and try again." "Red"
    exit 1
}

Write-Success "`n🚀 Processing fee system is now live on production!"
