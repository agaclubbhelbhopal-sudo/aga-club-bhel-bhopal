# Auto Backup Script for AGA Club App
# This script creates a timestamped backup of your project

# Define source and destination paths
$sourcePath = "c:\Users\Nehal\Documents\aga club app backups\aga_club_app"
$backupBasePath = "c:\Users\Nehal\Documents\aga club app backups"

# Create timestamp for backup folder
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolderName = "aga_club_backup_$timestamp"
$backupPath = Join-Path $backupBasePath $backupFolderName

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Copy all files and folders recursively
Write-Host "Starting backup process..."
Write-Host "Source: $sourcePath"
Write-Host "Destination: $backupPath"

try {
    # Copy all items recursively
    Copy-Item -Path "$sourcePath\*" -Destination $backupPath -Recurse -Force
    Write-Host "Backup completed successfully!" -ForegroundColor Green
    Write-Host "Backup location: $backupPath" -ForegroundColor Cyan
} catch {
    Write-Host "Error during backup: $_" -ForegroundColor Red
}

# Keep only the last 10 backups to save disk space
try {
    $backups = Get-ChildItem -Path $backupBasePath -Directory | Where-Object { $_.Name -like "aga_club_backup_*" } | Sort-Object CreationTime -Descending
    if ($backups.Count -gt 10) {
        $backupsToRemove = $backups | Select-Object -Skip 10
        foreach ($backup in $backupsToRemove) {
            Remove-Item -Path $backup.FullName -Recurse -Force
            Write-Host "Removed old backup: $($backup.Name)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error while cleaning up old backups: $_" -ForegroundColor Red
}

Write-Host "Backup process finished." -ForegroundColor Green