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
    const { email, question, answer } = JSON.parse(event.body);
    
    // In a real Netlify function, we would use a database or Netlify Identity
    // For this demo, we'll return a success response
    // In production, you would need to implement proper data persistence
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Security question saved successfully' 
      })
    };
  } catch (error) {
    console.error('Error parsing security question data:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid request data' })
    };
  }
};