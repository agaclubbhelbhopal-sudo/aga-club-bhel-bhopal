# AGA Club Bhel Bhopal Website

This is the official website for AGA Club Bhel Bhopal, built with HTML, CSS, and JavaScript.

## Features

- Responsive design that works on desktop and mobile devices
- Dynamic content loading from JSON files
- Event management system with automatic migration of past events
- Photo gallery with slideshow functionality
- Member directory with search capabilities
- Contact form integrated with Google Forms for message collection


## File Structure

```
aga_club_app/
├── index.html              # Homepage
├── committee.html          # Committee members page
├── events.html             # Past events page with gallery
├── upcoming.html           # Upcoming events page
├── membership.html         # Membership information and directory
├── about.html              # About the club
├── contact.html            # Contact information and form
├── thank-you.html          # Thank you page after form submission
├── content.json            # Main content data file
├── members.json            # Member directory data
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript file
├── simple_server.js        # Simple Node.js server for local development
├── js/
│   ├── contentLoader.js    # Content loading and management
│   └── backgroundSlideshow.js  # Background image slideshow
├── images/                 # Image assets
└── README.md               # This file
```

## How to Use

### Running the Website Locally

1. **Using the Simple Server (Recommended)**:
   - Run `node simple_server.js` from the command line
   - Open your browser and go to `http://localhost:8000`

2. **Direct File Opening**:
   - Open any HTML file directly in your browser
   - Note: Some features may not work due to browser security restrictions

### Managing Content

#### Events Management

The website automatically migrates events from "Upcoming Events" to "Past Events" based on their date. This happens automatically when loading the Upcoming Events page.

#### Adding Photos to Events

To add photos to an event's gallery:

1. Name your photos with the format: `[event-name]-[number].jpg`
   - Example: `navankur-1.jpg`, `navankur-2.jpg`
2. Place these photos in the `images` folder
3. Update `content.json`:
   - Find the event in either `upcomingEvents` or `pastEvents`
   - Add the photo paths to the event's `slideshowImages` array:
   
   ```json
   {
     "id": 1,
     "name": "Navankur",
     "date": "December 22, 2025",
     "venue": "Club Ground",
     "description": "Traditional tree planting ceremony...",
     "formLink": "",
     "image": "images/navankur.jpg",
     "slideshowImages": [
       "images/navankur-1.jpg",
       "images/navankur-2.jpg",
       "images/navankur-3.jpg"
     ]
   }
   ```

4. Refresh the page to see the updated gallery

#### Adding New Events

To add a new upcoming event:

1. Edit `content.json`
2. Add a new object to the `upcomingEvents` array:

   ```json
   {
     "id": 4,
     "name": "New Event Name",
     "date": "Month Day, Year",
     "venue": "Event Location",
     "description": "Event description...",
     "formLink": "optional-registration-link",
     "image": "images/event-image.jpg"
   }
   ```

3. Ensure the event image exists in the `images` folder
4. Refresh the Upcoming Events page

#### Editing Committee Members

To update committee member information:

1. Edit `content.json`
2. Modify the `committeeMembers` array as needed
3. Ensure member images exist in the `images` folder
4. Refresh the Committee page

#### Configuring the Contact Form

The contact form is now integrated with Google Forms:

1. The form is embedded using the iframe from Google Forms
2. Responses are automatically collected in the Google Form responses spreadsheet
3. The form ID is: `1FAIpQLSdd-HJa-HQcThQxLD65YwcdvyKL9KIeM8BvYMUxyxvG_Y0r-w`

No additional configuration is needed as the form is already embedded with the correct URL.


## Technical Details

### Content Loading

The website uses a dual approach for content loading:

1. **Primary Source**: `content.json` file
2. **Fallback**: Hardcoded default content in `js/contentLoader.js`

This ensures the website works both when running on a server and when opening HTML files directly in a browser.

### Automatic Event Migration

Events are automatically moved from "Upcoming Events" to "Past Events" when their date has passed. This check happens when loading the Upcoming Events page.

### Image Handling

- All images should be placed in the `images` folder
- Image paths in `content.json` should be relative to the root directory
- The system automatically adjusts paths for local file browsing

## Troubleshooting

### Images Not Showing

- Check that image files exist in the `images` folder
- Verify file names and extensions match exactly
- Ensure there are no typos in `content.json` image paths

### Content Not Updating

- Clear your browser cache
- Use the "Refresh Content" button on pages that have it
- Check that `content.json` is properly formatted

### Member List Not Loading

- Ensure `members.json` exists and is properly formatted
- When opening HTML files directly, the website uses fallback data

## Deployment

### Deploying to Netlify

This website can be easily deployed to Netlify with full functionality including the admin panel:

1. Connect your GitHub repository to Netlify
2. Set the build settings:
   - Build command: Leave empty (static site)
   - Publish directory: `.`
3. The Netlify functions will automatically be deployed from the `netlify/functions` directory
4. The admin panel will work with Netlify's serverless functions

### Local Development

For local development, you can still use the Node.js server:

1. **Using the Simple Server (Recommended)**:
   - Run `node simple_server.js` from the command line
   - Open your browser and go to `http://localhost:8000`

2. **Direct File Opening**:
   - Open any HTML file directly in your browser
   - Note: Some features may not work due to browser security restrictions

## Development

### Adding New Pages

1. Create a new HTML file based on the existing template
2. Include the navigation structure and footer
3. Add content loading scripts as needed
4. Update all navigation menus to include the new page

### Customizing Styles

All styles are in `styles.css`. The CSS is organized by sections for easy maintenance.

### Extending Functionality

New features can be added by:
1. Extending `content.json` with new data structures
2. Adding new methods to `js/contentLoader.js`
3. Creating new HTML pages or updating existing ones