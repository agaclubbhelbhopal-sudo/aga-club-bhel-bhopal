# AGA Club App - Server Startup Guide

## Prerequisites
- Node.js installed on your computer
- Project files located in `c:\Users\Nehal\Documents\aga club app backups\aga_club_app`

## Starting the Server

### Method 1: Using Command Prompt
1. Press `Win + R`, type `cmd`, and press Enter
2. Navigate to the project directory:
   ```bash
   cd "c:\Users\Nehal\Documents\aga club app backups\aga_club_app"
   ```
3. Start the server:
   ```bash
   node enhanced_server.js
   ```

### Method 2: Using PowerShell
1. Press `Win + X` and select "Windows PowerShell"
2. Navigate to the project directory:
   ```bash
   cd "c:\Users\Nehal\Documents\aga club app backups\aga_club_app"
   ```
3. Start the server:
   ```bash
   node enhanced_server.js
   ```

## Accessing the Application
- Open your web browser
- Go to `http://localhost:8003`

## Available Endpoints
- Main site: `http://localhost:8003`
- Admin panel: `http://localhost:8003/admin-panel.html`
- Admin login: `http://localhost:8003/admin-login.html`

## Stopping the Server
- Press `Ctrl + C` in the command prompt or PowerShell window

## Troubleshooting

### Port Already in Use
If you get an error that the port is already in use:
```bash
taskkill /IM node.exe /F
```
Then try starting the server again.

### Missing Dependencies
If you encounter module errors:
```bash
npm install
```

### Checking if Server is Running
You can verify the server is running by:
```bash
netstat -ano | findstr :8003
```

## Features Available on Local Server
- Image uploads
- Content management
- Membership management
- Committee member management
- All administrative functions

## Note
This local server is the only way to perform administrative tasks. GitHub Pages and Netlify deployments are read-only for visitors.