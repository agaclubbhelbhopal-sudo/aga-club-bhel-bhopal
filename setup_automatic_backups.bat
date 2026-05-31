@echo off
echo Setting up Automatic Backups for AGA Club App
echo ============================================
echo.

echo Creating scheduled task for daily backups at 9:00 PM...
echo.

schtasks /create /tn "AGA Club App Daily Backup" /tr "powershell -ExecutionPolicy Bypass -File \"C:\Users\Nehal\Documents\aga club app\auto_backup.ps1\"" /sc daily /st 21:00 /ru "%USERNAME%" /f

echo.
echo Scheduled task created successfully!
echo.
echo The backup will run automatically every day at 9:00 PM
echo Backups will be stored in: C:\Users\Nehal\Documents\aga club app backups
echo Only the 10 most recent backups will be kept to save disk space
echo.
echo To run a backup manually, double-click on "run_backup.bat"
echo.
echo Press any key to exit...
pause >nul