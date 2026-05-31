const http = require('http');

// Test data
const testData = {
  test: "data"
};

const data = JSON.stringify({
  content: testData
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/save-content',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();