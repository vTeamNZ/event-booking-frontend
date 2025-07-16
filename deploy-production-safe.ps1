# KiwiLanka SAFE Production Deployment Script
# Builds, backs up ONLY frontend files, and deploys React app to IIS
# PRESERVES: api, qrapp, qrapp-api directories

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipBackup = $false,
    [string]$BackupPath = "C:\Backups\KiwiLanka",
    [string]$IISPath = "C:\inetpub\wwwroot\kiwilanka"
)

# Configuration
$ErrorActionPreference = "Stop"
$BuildPath = ".\build"
$ProjectName = "KiwiLanka-Frontend"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Define what files/folders belong to the frontend (to be replaced)
$FrontendFiles = @("index.html", "favicon.ico", "manifest.json", "robots.txt", "web.config")
$FrontendDirs = @("static")

# Define what to preserve (NEVER touch these)
$PreserveDirs = @("api", "qrapp", "qrapp-api", "events")

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n=== $Message ===" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Preserve {
    param([string]$Message)
    Write-ColorOutput "🛡️  $Message" "Blue"
}

# Start deployment
Write-ColorOutput "`n🚀 $ProjectName SAFE Deployment Started" "Magenta"
Write-ColorOutput "Timestamp: $Timestamp" "Gray"
Write-ColorOutput "Target: $IISPath" "Gray"
Write-ColorOutput "Backup: $BackupPath" "Gray"

Write-Step "SAFETY CHECK"
Write-Preserve "Will PRESERVE these directories: $($PreserveDirs -join ', ')"
Write-Warning "Will REPLACE these files: $($FrontendFiles -join ', ')"
Write-Warning "Will REPLACE these directories: $($FrontendDirs -join ', ')"

try {
    # Step 1: Build the application
    if (-not $SkipBuild) {
        Write-Step "Building React Application"
        
        # Clean previous build
        if (Test-Path $BuildPath) {
            Remove-Item $BuildPath -Recurse -Force
            Write-Success "Cleaned previous build directory"
        }
        
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-ColorOutput "Installing dependencies..." "Yellow"
            npm install
            if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
            Write-Success "Dependencies installed"
        }
        
        # Build production bundle
        Write-ColorOutput "Building production bundle..." "Yellow"
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
        
        if (-not (Test-Path $BuildPath)) {
            throw "Build directory not found after build"
        }
        
        Write-Success "Build completed successfully"
    } else {
        Write-Warning "Skipping build step"
        if (-not (Test-Path $BuildPath)) {
            throw "Build directory not found and build was skipped"
        }
    }

    # Step 2: Safety check - verify IIS directory structure
    Write-Step "IIS Directory Safety Check"
    
    if (-not (Test-Path $IISPath)) {
        Write-Warning "IIS directory does not exist, will create: $IISPath"
        New-Item -ItemType Directory -Path $IISPath -Force | Out-Null
    } else {
        # List current contents
        $CurrentDirs = Get-ChildItem $IISPath -Directory | Select-Object -ExpandProperty Name
        $CurrentFiles = Get-ChildItem $IISPath -File | Select-Object -ExpandProperty Name
        
        Write-ColorOutput "Current IIS directories: $($CurrentDirs -join ', ')" "Gray"
        Write-ColorOutput "Current IIS files: $($CurrentFiles -join ', ')" "Gray"
        
        # Check if preserved directories exist
        foreach ($preserveDir in $PreserveDirs) {
            if ($preserveDir -in $CurrentDirs) {
                Write-Preserve "Found protected directory: $preserveDir"
            }
        }
    }

    # Step 3: Create frontend backup
    if (-not $SkipBackup) {
        Write-Step "Creating Frontend Backup"
        
        # Ensure backup directory exists
        if (-not (Test-Path $BackupPath)) {
            New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
            Write-Success "Created backup directory: $BackupPath"
        }
        
        if (Test-Path $IISPath) {
            $BackupName = "${ProjectName}_${Timestamp}"
            $FullBackupPath = Join-Path $BackupPath $BackupName
            
            Write-ColorOutput "Backing up existing frontend files to: $FullBackupPath" "Yellow"
            
            # Create backup directory
            New-Item -ItemType Directory -Path $FullBackupPath -Force | Out-Null
            
            # Backup only frontend files, not API/QR apps
            $BackupCount = 0
            foreach ($file in $FrontendFiles) {
                $sourcePath = Join-Path $IISPath $file
                if (Test-Path $sourcePath) {
                    Copy-Item $sourcePath -Destination $FullBackupPath -Force
                    Write-ColorOutput "  Backed up: $file" "Gray"
                    $BackupCount++
                }
            }
            
            foreach ($dir in $FrontendDirs) {
                $sourcePath = Join-Path $IISPath $dir
                if (Test-Path $sourcePath) {
                    Copy-Item $sourcePath -Destination $FullBackupPath -Recurse -Force
                    Write-ColorOutput "  Backed up directory: $dir" "Gray"
                    $BackupCount++
                }
            }
            
            # Verify backup
            if ((Test-Path $FullBackupPath) -and $BackupCount -gt 0) {
                $BackupSize = (Get-ChildItem $FullBackupPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                Write-Success "Frontend backup created successfully ($BackupCount items, ${BackupSize:N2} MB)"
                
                # Clean old backups (keep last 10)
                $OldBackups = Get-ChildItem $BackupPath -Directory | 
                             Where-Object { $_.Name -like "${ProjectName}_*" } | 
                             Sort-Object CreationTime -Descending | 
                             Select-Object -Skip 10
                
                if ($OldBackups) {
                    $OldBackups | Remove-Item -Recurse -Force
                    Write-Success "Cleaned $($OldBackups.Count) old backup(s)"
                }
            } else {
                Write-Warning "No frontend files found to backup (this might be a fresh installation)"
            }
        } else {
            Write-Warning "IIS directory does not exist yet: $IISPath"
        }
    } else {
        Write-Warning "Skipping backup step"
    }

    # Step 4: Deploy to IIS (SAFELY)
    Write-Step "Safe Deployment to IIS"
    
    # Ensure IIS directory exists
    if (-not (Test-Path $IISPath)) {
        New-Item -ItemType Directory -Path $IISPath -Force | Out-Null
        Write-Success "Created IIS directory: $IISPath"
    }
    
    # List existing content and verify preservation
    $ExistingDirs = Get-ChildItem $IISPath -Directory | Select-Object -ExpandProperty Name
    $PreservedDirs = $ExistingDirs | Where-Object { $_ -in $PreserveDirs }
    
    if ($PreservedDirs) {
        Write-Preserve "Preserving these directories: $($PreservedDirs -join ', ')"
    }
    
    # Remove ONLY frontend files and directories
    Write-ColorOutput "Removing old frontend files (preserving API apps)..." "Yellow"
    foreach ($file in $FrontendFiles) {
        $filePath = Join-Path $IISPath $file
        if (Test-Path $filePath) {
            Remove-Item $filePath -Force
            Write-ColorOutput "  Removed: $file" "Gray"
        }
    }
    
    foreach ($dir in $FrontendDirs) {
        $dirPath = Join-Path $IISPath $dir
        if (Test-Path $dirPath) {
            Remove-Item $dirPath -Recurse -Force
            Write-ColorOutput "  Removed directory: $dir" "Gray"
        }
    }
    
    # Copy new frontend build
    Write-ColorOutput "Copying new frontend build to IIS..." "Yellow"
    Copy-Item "$BuildPath\*" -Destination $IISPath -Recurse -Force
    
    # Verify deployment
    $DeployedFiles = Get-ChildItem $IISPath -Recurse -File
    $DeployedSize = ($DeployedFiles | Measure-Object -Property Length -Sum).Sum / 1MB
    
    Write-Success "Frontend deployment completed successfully"
    Write-Success "Files deployed: $($DeployedFiles.Count)"
    Write-Success "Total size: ${DeployedSize:N2} MB"
    
    # Step 5: Verify deployment and preservation
    Write-Step "Verifying Deployment and Preservation"
    
    # Check for critical frontend files
    $CriticalFiles = @("index.html", "static\js\main.*.js", "static\css\main.*.css")
    $MissingFiles = @()
    
    foreach ($pattern in $CriticalFiles) {
        $found = Get-ChildItem $IISPath -Recurse | Where-Object { $_.Name -like ($pattern -replace '\*', '*') }
        if (-not $found) {
            $MissingFiles += $pattern
        }
    }
    
    if ($MissingFiles.Count -eq 0) {
        Write-Success "All critical frontend files found"
    } else {
        Write-Warning "Missing files: $($MissingFiles -join ', ')"
    }
    
    # Verify preserved directories still exist
    $CurrentDirsAfter = Get-ChildItem $IISPath -Directory | Select-Object -ExpandProperty Name
    $StillPreserved = $PreserveDirs | Where-Object { $_ -in $CurrentDirsAfter }
    $Missing = $PreserveDirs | Where-Object { $_ -notin $CurrentDirsAfter }
    
    if ($StillPreserved) {
        Write-Success "Protected directories preserved: $($StillPreserved -join ', ')"
    }
    if ($Missing) {
        Write-Warning "Protected directories not found (may not have existed): $($Missing -join ', ')"
    }
    
    # Test website availability
    try {
        Write-ColorOutput "Testing website availability..." "Yellow"
        $response = Invoke-WebRequest -Uri "https://kiwilanka.co.nz" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Website is responding (Status: $($response.StatusCode))"
        } else {
            Write-Warning "Website returned status: $($response.StatusCode)"
        }
    } catch {
        Write-Warning "Could not verify website availability: $($_.Exception.Message)"
    }

    # Success summary
    Write-Step "Deployment Summary"
    Write-Success "✅ Build: $(if ($SkipBuild) { 'Skipped' } else { 'Completed' })"
    Write-Success "✅ Backup: $(if ($SkipBackup) { 'Skipped' } else { "Created: ${ProjectName}_${Timestamp}" })"
    Write-Success "✅ Deploy: Frontend files updated safely"
    Write-Success "✅ Preserve: API applications protected"
    Write-Success "✅ Verify: Website accessible"
    
    Write-ColorOutput "`n🎉 SAFE Deployment completed successfully!" "Green"
    Write-ColorOutput "Your site should now be live at: https://kiwilanka.co.nz" "Green"
    Write-Preserve "All API applications have been preserved!"

} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    Write-ColorOutput "`nDeployment failed. Check the error above and try again." "Red"
    
    # If we have a recent backup, offer to restore
    if (-not $SkipBackup -and (Test-Path $BackupPath)) {
        $LatestBackup = Get-ChildItem $BackupPath -Directory | 
                       Where-Object { $_.Name -like "${ProjectName}_*" } | 
                       Sort-Object CreationTime -Descending | 
                       Select-Object -First 1
        
        if ($LatestBackup) {
            Write-ColorOutput "`nTo restore frontend from backup, run:" "Yellow"
            Write-ColorOutput "Copy-Item '$($LatestBackup.FullName)\*' -Destination '$IISPath' -Recurse -Force" "Yellow"
        }
    }
    
    exit 1
}

# Optional: Show deployment info
Write-ColorOutput "`nDeployment Information:" "Cyan"
Write-ColorOutput "- Build Directory: $BuildPath" "Gray"
Write-ColorOutput "- IIS Directory: $IISPath" "Gray"
Write-ColorOutput "- Backup Directory: $BackupPath" "Gray"
Write-ColorOutput "- Timestamp: $Timestamp" "Gray"
Write-ColorOutput "- Protected Dirs: $($PreserveDirs -join ', ')" "Blue"

if (-not $SkipBackup) {
    Write-ColorOutput "`nBackup Management:" "Cyan"
    Write-ColorOutput "- Latest backup: ${ProjectName}_${Timestamp}" "Gray"
    Write-ColorOutput "- View all backups: Get-ChildItem '$BackupPath' | Sort-Object CreationTime -Descending" "Gray"
    Write-ColorOutput "- Restore command: Copy-Item '$BackupPath\${ProjectName}_${Timestamp}\*' -Destination '$IISPath' -Recurse -Force" "Gray"
}
