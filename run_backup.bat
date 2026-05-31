@echo off
echo AGA Club App Backup Utility
echo ==========================
echo Starting backup process...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0auto_backup.ps1"

echo.
echo Backup process completed.
echo Press any key to exit...
pause >nul