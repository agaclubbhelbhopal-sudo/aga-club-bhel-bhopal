# GitHub Workflow Guide for AGA Club Website Content Management

This guide explains how to update content on your AGA Club website when hosted on Netlify with GitHub.

## How Content Management Works

Your website loads content from `content.json` file using the enhanced contentLoader.js system. To update content:

1. Edit the `content.json` file directly in GitHub
2. Commit your changes
3. Netlify will automatically rebuild and deploy your site

## Enhanced Content Loading Features

The website now includes an advanced content loading system with:
- **Multi-approach loading**: Uses fetch() and XMLHttpRequest as fallback
- **Debug mode**: Enable detailed logging for troubleshooting
- **Cache management**: Smart caching with force refresh capability
- **Status monitoring**: Check loading status and errors
- **Local testing**: Use `test_local_server.html` to verify content loading

## Step-by-Step Content Update Process

### 1. Access Your Repository
- Go to your GitHub repository for the AGA Club website
- Navigate to the `content.json` file

### 2. Edit Content
Click the pencil icon to edit the file directly in GitHub.

### 3. Update Sections

#### Homepage Content
```json
{
  "homepage": {
    "header": {
      "title": "Welcome to AGA Club Bhel Bhopal",
      "subtitle": "Celebrating Community, Culture, and Togetherness",
      "backgroundImage": "images/hero-bg.jpg"
    },
    "leaders": [
      {
        "id": 1,
        "name": "President",
        "photo": "images/president.jpg",
        "messageTitle": "President's Message",
        "message": "Short message text",
        "fullMessage": "Full message text"
      }
    ],
    "gallery": [
      {
        "id": 1,
        "image": "images/photo.jpg",
        "alt": "Photo description"
      }
    ]
  }
}
```

#### Upcoming Events
```json
{
  "upcomingEvents": [
    {
      "id": 1,
      "name": "Event Name",
      "date": "Event Date",
      "venue": "Event Venue",
      "description": "Event Description",
      "formLink": "https://forms.google.com/...",
      "image": "images/event-image.jpg"
    }
  ]
}
```

#### Past Events
```json
{
  "pastEvents": [
    {
      "id": 1,
      "name": "Event Name",
      "date": "Event Date",
      "description": "Event Description",
      "image": "images/event-image.jpg",
      "photos": [
        "images/event-photo1.jpg",
        "images/event-photo2.jpg",
        "images/event-photo3.jpg"
      ]
    }
  ]
}
```

#### Committee Members
```json
{
  "committeeMembers": [
    {
      "id": 1,
      "name": "Member Name",
      "position": "Position Title",
      "image": "images/member-photo.jpg"
    }
  ]
}
```

#### About Us Content
```json
{
  "aboutContent": {
    "story": "Your club's story content",
    "mission": "Your mission statement",
    "vision": "Your vision statement",
    "joinUs": "Information about joining the club"
  }
}
```

#### Contact Information
```json
{
  "contactContent": {
    "address": "Full postal address",
    "phone": "Phone number",
    "email": "Email address",
    "hours": "Office hours",
    "location": "Location description"
  }
}
```

### 4. Save Changes
- Add a descriptive commit message (e.g., "Updated upcoming events for January")
- Select "Commit directly to the main branch"
- Click "Commit changes"

### 5. Wait for Deployment
- Netlify will automatically detect the changes
- Your site will rebuild and deploy with updated content
- This usually takes 1-2 minutes

## Testing Content Loading

### Local Testing with Enhanced Loader
1. Set up local server: `http-server -p 8080 -c-1`
2. Navigate to `http://localhost:8080/test_local_server.html`
3. Click "Test Content Loading" to verify functionality
4. Check debug output for detailed loading information

### Debug Mode
Enable debug mode in your browser console:
```javascript
contentLoader.debugMode = true;
contentLoader.loadContent().then(content => console.log('Content loaded:', content));
```

### Status Monitoring
Check loading status:
```javascript
const status = contentLoader.getStatus();
console.log(status); // Shows loading status, errors, and timestamps
```

## Best Practices

### Image Management
- Upload new images to the `images/` folder in your repository
- Reference images with relative paths (e.g., "images/new-event.jpg")
- Use descriptive filenames
- For events, you can now include multiple photos in the `photos` array

### Content Updates
- Always use valid JSON syntax
- Test your JSON at https://jsonlint.com/ if you're unsure
- Keep IDs unique and sequential within each section
- Use the enhanced loader's debug features during development

### Collaborative Editing
- Multiple admins can edit the content.json file
- GitHub tracks all changes and who made them
- Use meaningful commit messages to describe changes
- Test content loading after major changes

## Troubleshooting

### Content Not Updating
1. Check that your JSON syntax is valid
2. Verify Netlify deployment completed successfully
3. Clear your browser cache or try incognito mode
4. Use `test_local_server.html` to test content loading
5. Enable debug mode to see detailed loading information

### Images Not Showing
1. Confirm the image file exists in the images folder
2. Check that the path in content.json matches the actual filename
3. Verify the image file extension is correct (.jpg, .png, etc.)
4. Test with debug mode enabled for detailed error information

### Content Loading Errors
1. Check browser console for error messages
2. Use `contentLoader.getStatus()` to check loading status
3. Test with `test_local_server.html` for detailed diagnostics
4. Verify content.json is accessible and properly formatted

### Local Server Issues
1. Ensure http-server is running: `http-server -p 8080 -c-1`
2. Test content loading with `test_local_server.html`
3. Check that content.json is in the root directory
4. Use debug mode for detailed loading information

## Need Help?

If you encounter issues:
1. Check GitHub for any error notifications
2. Review your recent commits for syntax errors
3. Use the enhanced debugging features
4. Test with `test_local_server.html`
5. Contact support if the problem persists

## Advanced Features

### Force Refresh Cache
If content changes don't appear immediately:
```javascript
contentLoader.forceRefresh();
```

### Custom Content Sources
The enhanced loader supports custom content URLs:
```javascript
contentLoader.contentUrl = 'path/to/your/content.json';
```

### Error Handling
Enhanced error reporting:
```javascript
try {
  const content = await contentLoader.loadContent();
  console.log('Content loaded successfully');
} catch (error) {
  console.error('Loading failed:', error.message);
  console.log('Status:', contentLoader.getStatus());
}
```