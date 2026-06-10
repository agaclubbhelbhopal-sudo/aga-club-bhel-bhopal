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
    const { email, question, answer } = JSON.parse(event.body);
    
    // Get admins data from GitHub
    const { data: adminsData, sha } = await getJsonDataFromGitHub(config.ADMINS_FILE_PATH);
    
    // Find the user
    const userIndex = adminsData.users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'User not found' })
      };
    }
    
    // Update security question and answer
    adminsData.users[userIndex].securityQuestion = question;
    adminsData.users[userIndex].securityAnswer = answer;
    // Mark first login as completed
    adminsData.users[userIndex].firstLogin = false;
    
    // Save updated data to GitHub
    await saveJsonDataToGitHub(
      config.ADMINS_FILE_PATH, 
      adminsData, 
      sha, 
      `Update security question for ${email}`
    );
    
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