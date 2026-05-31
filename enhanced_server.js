const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const formidable = require('formidable');

const PORT = 8003;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle file uploads
  if (req.method === 'POST' && req.url === '/upload') {
    handleFileUpload(req, res);
    return;
  }
  
  // Handle admin login
  if (req.method === 'POST' && req.url === '/admin-login') {
    handleAdminLogin(req, res);
    return;
  }
  
  // Handle security question setup
  if (req.method === 'POST' && req.url === '/setup-security-question') {
    handleSecurityQuestionSetup(req, res);
    return;
  }
  
  // Handle password reset
  if (req.method === 'POST' && req.url === '/reset-password') {
    handlePasswordReset(req, res);
    return;
  }
  
  // Get security question
  if (req.method === 'POST' && req.url === '/get-security-question') {
    handleGetSecurityQuestion(req, res);
    return;
  }
  
  // Handle content saving
  if (req.method === 'POST' && req.url === '/save-content') {
    handleSaveContent(req, res);
    return;
  }
  
  // Handle membership data saving
  if (req.method === 'POST' && req.url === '/save-members') {
    handleSaveMembers(req, res);
    return;
  }
  
  // Handle image deletion
  if (req.method === 'POST' && req.url === '/delete-image') {
    handleDeleteImage(req, res);
    return;
  }
  
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
  const isBinary = contentType.startsWith('image/');
  
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

function handleFileUpload(req, res) {
  const form = new formidable.IncomingForm();
  form.uploadDir = "./images"; // Upload directory
  form.keepExtensions = true; // Keep file extensions
  
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error parsing form' }));
      return;
    }
    
    // Check if a file was uploaded
    if (!files.image) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'No file uploaded' }));
      return;
    }
    
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const file = files.image;
    const fileType = file.type;
    const fileSize = file.size;
    
    // Check file type
    if (!allowedTypes.includes(fileType)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' }));
      return;
    }
    
    // Check file size
    if (fileSize > maxSize) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'File too large. Maximum size is 10MB.' }));
      return;
    }
    
    const oldPath = files.image.path;
    const fileName = files.image.name;
    const newPath = path.join(form.uploadDir, fileName);
    
    // Check if file already exists and generate unique name if needed
    const checkAndCopyFile = () => {
      fs.access(newPath, fs.constants.F_OK, (err) => {
        if (!err) {
          // File exists, generate unique name
          const ext = path.extname(fileName);
          const baseName = path.basename(fileName, ext);
          const timestamp = Date.now();
          const newFileName = `${baseName}_${timestamp}${ext}`;
          const newUniquePath = path.join(form.uploadDir, newFileName);
          
          console.log(`File ${fileName} exists, using unique name: ${newFileName}`);
          copyFileToDestination(oldPath, newUniquePath, newFileName);
        } else {
          // File doesn't exist, use original name
          copyFileToDestination(oldPath, newPath, fileName);
        }
      });
    };
    
    const copyFileToDestination = (sourcePath, destPath, finalFileName) => {
      // Move the file to the images directory
      // Use copy + unlink approach to avoid EPERM issues on Windows
      fs.copyFile(sourcePath, destPath, (err) => {
        if (err) {
          console.error('Error copying file:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Error saving file' }));
          return;
        }
        
        // Delete the temporary file after successful copy
        fs.unlink(sourcePath, (unlinkErr) => {
          if (unlinkErr) {
            console.warn('Warning: Could not delete temporary file:', unlinkErr);
            // Continue anyway since the file was successfully copied
          }
        });
        
        // Return success response with the file path
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'File uploaded successfully',
          filePath: `images/${finalFileName}`
        }));
      });
    };
    
    // Start the file copying process
    checkAndCopyFile();
  });
}

function handleSaveContent(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Save to content.json
      if (data.content) {
        // Read the existing content.json to preserve any missing fields
        fs.readFile('./content.json', 'utf8', (err, existingContent) => {
          if (err) {
            console.error('Error reading existing content.json:', err);
            // If file doesn't exist, use the provided content
            saveContentToFile(data.content, res);
            return;
          }
          
          try {
            // Parse existing content
            const existingData = JSON.parse(existingContent);
            
            // Merge the provided content with existing content
            // This preserves any fields not included in the update
            const mergedContent = { ...existingData, ...data.content };
            
            // Also merge nested objects, but handle deletions properly
            for (const key in data.content) {
              if (typeof data.content[key] === 'object' && data.content[key] !== null &&
                  typeof existingData[key] === 'object' && existingData[key] !== null) {
                // For objects, we need to handle deletions properly
                // If the incoming object is an array-like object (with numeric keys),
                // we replace it entirely rather than merging
                const isIncomingArrayLike = Object.keys(data.content[key]).every(k => !isNaN(k));
                const isExistingArrayLike = Object.keys(existingData[key]).every(k => !isNaN(k));
                
                if (isIncomingArrayLike && isExistingArrayLike) {
                  // Replace the entire object for array-like structures
                  mergedContent[key] = data.content[key];
                } else {
                  // Regular object merge
                  mergedContent[key] = { ...existingData[key], ...data.content[key] };
                }
              }
            }
            
            saveContentToFile(mergedContent, res);
          } catch (parseErr) {
            console.error('Error parsing existing content:', parseErr);
            // If there's an error parsing existing content, use the provided content
            saveContentToFile(data.content, res);
          }
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'No content provided' }));
      }
    } catch (error) {
      console.error('Error parsing content:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON data' }));
    }
  });
}

function saveContentToFile(content, res) {
  fs.writeFile('./content.json', JSON.stringify(content, null, 2), (err) => {
    if (err) {
      console.error('Error saving content.json:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error saving content' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Content saved successfully' }));
  });
}

function handleSaveMembers(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Save to members.json
      if (data.members) {
        fs.writeFile('./members.json', JSON.stringify(data.members, null, 2), (err) => {
          if (err) {
            console.error('Error saving members.json:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Error saving members' }));
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Members saved successfully' }));
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'No members data provided' }));
      }
    } catch (error) {
      console.error('Error parsing members data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON data' }));
    }
  });
}

// Authentication endpoints
function handleAdminLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const credentials = JSON.parse(body);
      const { email, password } = credentials;
      
      // Read admin users from file
      fs.readFile('./admins.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading admins.json:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
          return;
        }
        
        try {
          const adminsData = JSON.parse(data);
          const adminUsers = adminsData.users;
          
          // Check if user exists
          const user = adminUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
            // Check if it's the user's first login
            const isFirstLogin = user.firstLogin === true;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Login successful',
              firstLogin: isFirstLogin
            }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
          }
        } catch (parseError) {
          console.error('Error parsing admins.json:', parseError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
        }
      });
    } catch (error) {
      console.error('Error parsing login data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
    }
  });
}

// Handle security question setup
function handleSecurityQuestionSetup(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const { email, question, answer } = JSON.parse(body);
      
      // Read admin users from file
      fs.readFile('./admins.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading admins.json:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
          return;
        }
        
        try {
          const adminsData = JSON.parse(data);
          
          // Find the user
          const userIndex = adminsData.users.findIndex(u => u.email === email);
          
          if (userIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'User not found' }));
            return;
          }
          
          // Update security question and answer
          adminsData.users[userIndex].securityQuestion = question;
          adminsData.users[userIndex].securityAnswer = answer;
          // Mark first login as completed
          adminsData.users[userIndex].firstLogin = false;
          
          // Save updated data
          fs.writeFile('./admins.json', JSON.stringify(adminsData, null, 2), (writeErr) => {
            if (writeErr) {
              console.error('Error writing admins.json:', writeErr);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Server error' }));
              return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Security question saved successfully' }));
          });
        } catch (parseError) {
          console.error('Error parsing admins.json:', parseError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
        }
      });
    } catch (error) {
      console.error('Error parsing security question data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
    }
  });
}

// Handle password reset
function handlePasswordReset(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const { email, answer, newPassword } = JSON.parse(body);
      
      // Read admin users from file
      fs.readFile('./admins.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading admins.json:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
          return;
        }
        
        try {
          const adminsData = JSON.parse(data);
          
          // Find the user
          const user = adminsData.users.find(u => u.email === email);
          
          if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'User not found' }));
            return;
          }
          
          // Check if security question is set
          if (!user.securityQuestion) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Security question not set' }));
            return;
          }
          
          // Check security answer
          if (user.securityAnswer.toLowerCase() !== answer.toLowerCase()) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Incorrect security answer' }));
            return;
          }
          
          // Update password
          user.password = newPassword;
          
          // Save updated data
          fs.writeFile('./admins.json', JSON.stringify(adminsData, null, 2), (writeErr) => {
            if (writeErr) {
              console.error('Error writing admins.json:', writeErr);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Server error' }));
              return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Password reset successfully' }));
          });
        } catch (parseError) {
          console.error('Error parsing admins.json:', parseError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
        }
      });
    } catch (error) {
      console.error('Error parsing password reset data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
    }
  });
}

// Get security question for a user
function handleGetSecurityQuestion(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const { email } = JSON.parse(body);
      
      // Read admin users from file
      fs.readFile('./admins.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading admins.json:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
          return;
        }
        
        try {
          const adminsData = JSON.parse(data);
          
          // Find the user
          const user = adminsData.users.find(u => u.email === email);
          
          if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'User not found' }));
            return;
          }
          
          // Check if security question is set
          if (!user.securityQuestion) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Security question not set' }));
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, question: user.securityQuestion }));
        } catch (parseError) {
          console.error('Error parsing admins.json:', parseError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Server error' }));
        }
      });
    } catch (error) {
      console.error('Error parsing request data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
    }
  });
}

function handleDeleteImage(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const imagePath = data.imagePath;
      
      if (!imagePath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Image path is required' }));
        return;
      }
      
      // Extract the filename from the path
      const filename = path.basename(imagePath);
      const fullPath = path.join('./images', filename);
      
      // Check if the file exists
      fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`Image file not found: ${fullPath}`);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Image file not found' }));
          return;
        }
        
        // Delete the file
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Error deleting image file' }));
            return;
          }
          
          console.log(`Image file deleted successfully: ${fullPath}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Image deleted successfully' }));
        });
      });
    } catch (error) {
      console.error('Error parsing request data:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
    }
  });
}

server.listen(PORT, () => {
  console.log(`Enhanced server running at http://localhost:${PORT}/`);
  console.log('File upload endpoint available at POST /upload');
  console.log('Content save endpoint available at POST /save-content');
  console.log('Membership save endpoint available at POST /save-members');
  console.log('Admin login endpoint available at POST /admin-login');
  console.log('Security question setup endpoint available at POST /setup-security-question');
  console.log('Password reset endpoint available at POST /reset-password');
  console.log('Get security question endpoint available at POST /get-security-question');
  console.log('Image deletion endpoint available at POST /delete-image');
});