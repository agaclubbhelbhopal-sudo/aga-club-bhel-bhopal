const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Save to content.json
    if (data.content) {
      // In a real Netlify function, you would typically use a database or external storage
      // For this implementation, we'll return a simulated success response
      // since Netlify functions don't have direct filesystem write access
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Content saving is not supported on Netlify. Please use the local server for content management.'
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, message: 'No content provided' })
      };
    }
  } catch (error) {
    console.error('Error parsing content:', error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, message: 'Invalid JSON data' })
    };
  }
};