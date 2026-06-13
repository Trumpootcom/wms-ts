# Always run from this script's folder
cd "$PSScriptRoot"

Write-Host "Starting VTT Slicer..." -ForegroundColor Cyan

# Install dependencies (safe to run every time)
Write-Host "Running npm install..."
npm install

# Start dev server in background
Write-Host "Launching dev server..."
$process = Start-Process -NoNewWindow -PassThru -FilePath "npm.cmd" -ArgumentList "run", "dev"

# Wait for server to be available
$maxAttempts = 20
$attempt = 0
$ready = $false

Write-Host "Waiting for server on http://localhost:5173 ..."

while (-not $ready -and $attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 1
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        Start-Sleep -Seconds 1
        $attempt++
    }
}

if ($ready) {
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost:5173"
} else {
    Write-Host "Server not confirmed yet, opening browser anyway..." -ForegroundColor Yellow
    Start-Process "http://localhost:5173"
}

# Keep script attached to npm output
Wait-Process $process.Id
