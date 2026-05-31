# GitHub Setup Guide for AGA Club Website

This guide will walk you through setting up your GitHub repository for the AGA Club website with Netlify hosting.

## Important Note About Images

Before uploading your files to GitHub, please ensure all images are properly sized and named:

1. **Logo**: Resize to exactly 512x512 pixels using the provided `resize_logo.html` tool
2. **Homepage Photos**: Use the `homepage_photos_manager.html` tool to prepare and download images
3. **Naming**: All image filenames must match exactly what's referenced in `content.json`

## Prerequisites
- A GitHub account
- All website files ready on your computer
- Git installed on your computer (optional but recommended)

## Step 1: Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Enter repository name: `aga-club-bhel-bhopal`
5. Set visibility to "Public" (or "Private" if you prefer)
6. **Do NOT initialize with a README**
7. Click "Create repository"

## Step 2: Prepare Your Local Files

Make sure all your website files are in one folder on your computer. You'll need to organize your images in the main `images/` directory:
```
aga-club-bhel-bhopal/
├── index.html
├── about.html
├── committee.html
├── events.html
├── upcoming.html
├── contact.html
├── script.js
├── styles.css
├── content.json
├── js/
│   └── contentLoader.js
├── images/
│   ├── aga club logo.jpg
│   ├── hero-bg.jpg
│   ├── president.jpg
│   ├── chairman.jpg
│   ├── secretary.jpg
│   ├── treasurer.jpg
│   ├── event-coordinator.jpg
│   ├── sports-head.jpg
│   ├── holi.jpg
│   ├── garba.jpg
│   ├── diwali.jpg
│   ├── basketball.jpg
│   ├── children-competition.jpg
│   ├── sports-day.jpg
│   ├── new-year.jpg
│   ├── republic-day.jpg
│   ├── valentine.jpg
│   ├── mother-day.jpg
│   └── independence-day.jpg
└── GitHub_Workflow_Guide.md
```

**Preparing Images:**

1. **Resize Logo**: Open `resize_logo.html` in your browser and use it to resize your logo to exactly 512x512 pixels
2. **Prepare Homepage Photos**: Use `homepage_photos_manager.html` to prepare and download header background, leader photos, and gallery images
3. **Organize Images**: Copy all required images to the main `images/` directory with the exact filenames shown above

If you don't have all these images yet, you can:
- Use the same image for multiple roles (e.g., use president.jpg for chairman.jpg too)
- Temporarily use placeholder images
- Download free stock photos from sites like Unsplash or Pexels

## Step 3: Upload Files to GitHub

### Option A: Using GitHub's Web Interface (Easiest)

1. On your new repository page, click "uploading a file"
2. Drag and drop all your website files into the upload area
3. Add a commit message: "Initial website files"
4. Select "Commit directly to the main branch"
5. Click "Commit changes"

### Option B: Using Git Command Line

1. Open Terminal/Command Prompt
2. Navigate to your website folder:
   ```
   cd "C:\Users\Nehal\Documents\aga club app"
   ```
3. Initialize Git repository:
   ```
   git init
   ```
4. Add all files:
   ```
   git add .
   ```
5. Commit files:
   ```
   git commit -m "Initial website files"
   ```
6. Add remote origin (replace USERNAME with your GitHub username):
   ```
   git remote add origin https://github.com/USERNAME/aga-club-bhel-bhopal.git
   ```
7. Push to GitHub:
   ```
   git push -u origin main
   ```

## Step 4: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/sign in
2. Click "Add new site" → "Import an existing project"
3. Click "GitHub" and authorize Netlify to access your GitHub account
4. Select your `aga-club-bhel-bhopal` repository
5. Configure deployment settings:
   - Branch to deploy: `main`
   - Build command: Leave empty (static site)
   - Publish directory: Leave empty (root)
6. Click "Deploy site"

## Step 5: Configure Custom Domain (Optional)

1. In Netlify, go to your site settings
2. Click "Domain management"
3. Add your custom domain
4. Follow Netlify's DNS configuration instructions

## Step 6: Test Content Management

1. Go to your GitHub repository
2. Click on `content.json` file
3. Click the pencil icon to edit
4. Make a small change (e.g., update a title)
5. Commit changes directly to the main branch
6. Wait 1-2 minutes and refresh your website to see changes

## Troubleshooting

### If Website Doesn't Deploy
- Check that all files were uploaded correctly
- Verify Netlify deployment logs
- Ensure `index.html` is in the root directory

### If Content Changes Don't Appear
- Check that JSON syntax is valid
- Verify file paths for images are correct
- Clear browser cache or try incognito mode

### If Images Don't Load
- Confirm all images are in the `images/` folder
- Check that file extensions are correct (.jpg, .png, etc.)
- Verify image filenames match those in `content.json`

## Need Help?

If you encounter any issues:
1. Check GitHub for error notifications
2. Review Netlify deployment logs
3. Refer to `GitHub_Workflow_Guide.md` for content management instructions
4. Contact support if problems persist