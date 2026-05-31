# AGA Club App Backup System

This document explains how to use the automatic backup system for your AGA Club website.

## What This Backup System Does

1. Creates complete backups of your entire AGA Club website project
2. Automatically saves backups with timestamps for easy identification
3. Keeps only the 10 most recent backups to save disk space
4. Runs automatically every day at 9:00 PM
5. Stores backups in a separate folder: `C:\Users\Nehal\Documents\aga club app backups`

## How to Set Up Automatic Backups

1. Double-click on the file `setup_automatic_backups.bat`
2. Confirm any security prompts that appear
3. The system will set up a scheduled task that runs daily at 9:00 PM

## How to Run a Manual Backup

If you want to create a backup right now:

1. Double-click on the file `run_backup.bat`
2. Wait for the process to complete
3. Your backup will be saved in the backups folder

## Backup Storage Location

All backups are stored in:
`C:\Users\Nehal\Documents\aga club app backups`

Each backup is in its own folder with a timestamp, for example:
`aga_club_backup_2025-12-09_18-30-45`

## Restoring from a Backup

To restore your website from a backup:

1. Navigate to `C:\Users\Nehal\Documents\aga club app backups`
2. Find the backup folder with the date/time you want to restore
3. Copy all files from that backup folder
4. Paste them into your main project folder: `C:\Users\Nehal\Documents\aga club app`
5. Confirm replacing existing files when prompted

## Managing Backup Schedule

### To View Scheduled Tasks:
1. Press Windows Key + R
2. Type `taskschd.msc` and press Enter
3. Look for "AGA Club App Daily Backup" in the task list

### To Change Backup Time:
1. Open Task Scheduler (taskschd.msc)
2. Find "AGA Club App Daily Backup"
3. Right-click and select "Properties"
4. Go to the "Triggers" tab
5. Edit the time as needed

### To Disable Automatic Backups:
1. Open Task Scheduler (taskschd.msc)
2. Find "AGA Club App Daily Backup"
3. Right-click and select "Disable" or "Delete"

## Troubleshooting

### If backups aren't running:
1. Check if the scheduled task is enabled in Task Scheduler
2. Verify that your computer is on at 9:00 PM
3. Check Windows Event Viewer for any error messages

### If you get permission errors:
1. Make sure you're running the setup as an administrator
2. Check that the backup folder has write permissions

### If you need more backups:
The system automatically keeps only 10 backups. If you need more:
1. Manually copy important backups to another location
2. Or modify the PowerShell script to keep more backups

## Important Notes

1. Backups include ALL files in your project folder
2. The system will automatically clean up old backups to save space
3. Make sure you have enough disk space for backups (approximately 50-100MB per backup depending on images)
4. For extra safety, consider copying important backups to cloud storage or external drives