const config = require('./config');
const { getJsonDataFromGitHub, saveJsonDataToGitHub } = require('./github-utils');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { email, answer, newPassword } = JSON.parse(event.body);
    
    // Get admins data from GitHub
    const { data: adminsData, sha } = await getJsonDataFromGitHub(config.ADMINS_FILE_PATH);
    
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
    
    // Check security answer (case insensitive)
    if (user.securityAnswer.toLowerCase() !== answer.toLowerCase()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Incorrect security answer' })
      };
    }
    
    // Update password
    user.password = newPassword;
    
    // Save updated data to GitHub
    await saveJsonDataToGitHub(
      config.ADMINS_FILE_PATH, 
      adminsData, 
      sha, 
      `Reset password for ${email}`
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Password reset successfully' 
      })
    };
  } catch (error) {
    console.error('Error parsing password reset data:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid request data' })
    };
  }
};