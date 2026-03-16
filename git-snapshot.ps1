# Create timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"

# Ensure bak folder exists
$bakFolder = "bak"
if (!(Test-Path $bakFolder)) {
    New-Item -ItemType Directory -Path $bakFolder | Out-Null
}

# Snapshot file name
$zipName = "$bakFolder\snapshot_$timestamp.zip"

# Create git archive
git archive -o $zipName HEAD

Write-Host ""
Write-Host "Snapshot created:"
Write-Host $zipName
Write-Host ""
