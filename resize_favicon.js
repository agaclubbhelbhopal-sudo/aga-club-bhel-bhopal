const sharp = require('sharp');
const path = require('path');

// Resize the image to 50x50 pixels
sharp(path.join(__dirname, 'images', 'aga_club_site.jpg'))
  .resize(50, 50)
  .jpeg({ quality: 80 })
  .toFile(path.join(__dirname, 'images', 'favicon.jpg'))
  .then(() => {
    console.log('Favicon resized successfully to 50x50 pixels');
  })
  .catch(err => {
    console.error('Error resizing favicon:', err);
  });