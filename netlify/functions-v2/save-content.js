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
    const requestData = JSON.parse(event.body);
    const contentToUpdate = requestData.content;
    
    if (!contentToUpdate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'No content provided' })
      };
    }
    
    // Get current content from GitHub
    const { data: currentContent, sha } = await getJsonDataFromGitHub(config.CONTENT_FILE_PATH);
    
    // Merge the provided content with existing content
    // This preserves any fields not included in the update
    const mergedContent = { ...currentContent, ...contentToUpdate };
    
    // Also merge nested objects, but handle deletions properly
    for (const key in contentToUpdate) {
      if (typeof contentToUpdate[key] === 'object' && contentToUpdate[key] !== null &&
          typeof currentContent[key] === 'object' && currentContent[key] !== null) {
        // For objects, we need to handle deletions properly
        // If the incoming object is an array-like object (with numeric keys),
        // we replace it entirely rather than merging
        const isIncomingArrayLike = Object.keys(contentToUpdate[key]).every(k => !isNaN(k));
        const isExistingArrayLike = Object.keys(currentContent[key]).every(k => !isNaN(k));
        
        if (isIncomingArrayLike && isExistingArrayLike) {
          // Replace the entire object for array-like structures
          mergedContent[key] = contentToUpdate[key];
        } else {
          // Regular object merge
          mergedContent[key] = { ...currentContent[key], ...contentToUpdate[key] };
        }
      }
    }
    
    // Save updated content to GitHub
    await saveJsonDataToGitHub(
      config.CONTENT_FILE_PATH, 
      mergedContent, 
      sha, 
      'Update website content via admin panel'
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Content saved successfully' 
      })
    };
  } catch (error) {
    console.error('Error saving content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Error saving content' })
    };
  }
};