const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Netlify Functions don't support multipart/form-data directly
  // For image uploads on Netlify, we need to use a different approach
  // Return an error message explaining that image uploads are not supported on Netlify
  
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      message: 'Image uploads are not supported on Netlify. Please use the local server for image uploads.'
    })
  };
};