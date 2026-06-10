const adminsData = require('../../admins.json');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const credentials = JSON.parse(event.body);
    const { email, password } = credentials;

    // Check if user exists
    const user = adminsData.users.find(u => u.email === email && u.password === password);

    if (user) {
      // Check if it's the user's first login
      const isFirstLogin = user.firstLogin === true;

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          firstLogin: isFirstLogin
        })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      };
    }
  } catch (error) {
    console.error('Error parsing login data:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid request data' })
    };
  }
};