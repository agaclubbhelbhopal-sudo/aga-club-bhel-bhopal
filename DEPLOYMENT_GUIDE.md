# AGA Club Application Deployment Guide

This guide explains how to deploy and run the AGA Club application in different environments.

## Three Deployment Modes

The application is designed to work in three different environments:

### 1. GitHub Deployment (Production)
- Content is loaded from `content.json`
- Images are served from the repository
- Ideal for public websites

### 2. Local File Access (Development/Testing)
- Open HTML files directly in browser
- Content is loaded from `content.json`
- No server required

### 3. Local Server (Development)
- Run with Node.js http-server
- Content is loaded from `content.json`
- Best for development and testing

## Setup Instructions

### GitHub Deployment
1. Push all files to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to GitHub Actions or master branch
4. The application will automatically load content from `content.json`

### Local File Access
1. Download or clone the repository
2. Open any HTML file directly in your browser (e.g., `index.html`)
3. The application will load content from `content.json`

### Local Server
1. Install Node.js http-server globally:
   ```bash
   npm install -g http-server
   ```
2. Navigate to the project directory
3. Start the server:
   ```bash
   http-server -p 8080 -c-1
   ```
4. Open browser and go to `http://localhost:8080`
5. The application will load content from `content.json`

## Enhanced Content Loading (contentLoader.js)

The application now includes an enhanced content loading system with multiple fallback mechanisms:

### Features
- **Multi-approach loading**: Uses fetch() and XMLHttpRequest as fallback
- **Debug mode**: Enable detailed logging for troubleshooting
- **Cache management**: Smart caching with force refresh capability
- **Status monitoring**: Check loading status and errors
- **Local file compatibility**: Works with both local files and server environments

### Usage
```javascript
// Basic usage
const contentLoader = new ContentLoader();
const content = await contentLoader.loadContent();

// Enable debug mode
contentLoader.debugMode = true;

// Force refresh cache
contentLoader.forceRefresh();

// Check status
const status = contentLoader.getStatus();
console.log(status); // { loaded: true, error: null, lastLoadTime: timestamp }
```

### Testing Content Loading
Use the included `test_local_server.html` file to test content loading:
1. Navigate to `http://localhost:8080/test_local_server.html`
2. Click "Test Content Loading" to verify functionality
3. Check the debug output for detailed information

## Content Management

### Using content.json
- Edit `content.json` to update text content
- Add images to the `images` directory
- Reference images using relative paths (e.g., `images/logo.jpg`)
- The enhanced loader supports both local file access and server environments

### Content Structure
The `content.json` file should follow this structure:
```json
{
  "committeeMembers": [...],
  "pastEvents": [...],
  "upcomingEvents": [...],
  "galleryImages": [...]
}
```

## Troubleshooting

### Images Not Loading
- Ensure all image files exist in the correct directories
- Check file permissions
- Verify image paths in `content.json`
- Enable debug mode to see detailed loading information

### Content Not Displaying
- Confirm `content.json` is properly formatted (valid JSON)
- Check browser console for JavaScript errors
- Use `test_local_server.html` to test content loading
- Ensure the server is running (for local server mode)

### Local Server Issues
- Verify http-server is installed: `npm list -g http-server`
- Check if port 8080 is available or use a different port
- Use `-c-1` flag to disable caching during development
- Enable debug mode in contentLoader.js for detailed logs

### GitHub Deployment Issues
- Verify all files are pushed to the repository
- Check GitHub Pages settings
- Ensure `content.json` is in the root directory
- Check browser console for CORS or loading errors

## Best Practices

1. Always test in all three environments before deploying
2. Keep `content.json` up to date with your content
3. Use relative paths for all assets
4. Validate JSON syntax in `content.json`
5. Optimize images for web use
6. Use debug mode during development to identify issues
7. Test content loading with `test_local_server.html`
8. Clear browser cache when testing changes
9. Use consistent image naming conventions
10. Backup your `content.json` before major changes

## Advanced Configuration

### Custom Content Sources
The contentLoader.js can be extended to load from different sources:
```javascript
// Load from custom URL
contentLoader.contentUrl = 'path/to/your/content.json';

// Load from different formats
contentLoader.loadFromCustomSource = async function() {
  // Your custom loading logic
};
```

### Error Handling
The enhanced loader provides detailed error information:
```javascript
try {
  const content = await contentLoader.loadContent();
  console.log('Content loaded successfully');
} catch (error) {
  console.error('Loading failed:', error.message);
  console.log('Status:', contentLoader.getStatus());
}
```