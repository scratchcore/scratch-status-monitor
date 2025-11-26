while ($true) {
  try {
    Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8787/cron -TimeoutSec 10
    Write-Host "$(Get-Date -Format o) - cron called"
  } catch {
    Write-Host "$(Get-Date -Format o) - cron error: $_"
  }
  Start-Sleep -Seconds 10
}