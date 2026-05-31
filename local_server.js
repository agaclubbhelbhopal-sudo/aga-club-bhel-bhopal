const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8004;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Properly parse and decode the URL
  const parsedUrl = url.parse(req.url);
  let filePath = '.' + decodeURIComponent(parsedUrl.pathname);
  
  // Handle root path
  if (filePath === './') {
    filePath = './index.html';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Determine encoding based on content type
  const isBinary = contentType.startsWith('image/') || contentType === 'image/x-icon';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        fs.readFile('./404.html', (err, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content404 || '404 Not Found', 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      // Send binary data without encoding for images
      if (isBinary) {
        res.end(content);
      } else {
        res.end(content, 'utf-8');
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});