const config = require('./config');
const { getJsonDataFromGitHub } = require('./github-utils');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);
    
    // Get admins data from GitHub
    const { data: adminsData } = await getJsonDataFromGitHub(config.ADMINS_FILE_PATH);
    
    // Find the user
    const user = adminsData.users.find(u => u.email === email);
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'User not found' })
      };
    }
    
    // Check if security question is set
    if (!user.securityQuestion) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Security question not set' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        question: user.securityQuestion 
      })
    };
  } catch (error) {
    console.error('Error parsing request data:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid request data' })
    };
  }
};