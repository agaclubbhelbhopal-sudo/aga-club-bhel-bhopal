const config = require('./config');

// GitHub API base URL
const GITHUB_API_URL = 'https://api.github.com';

/**
 * Get file content from GitHub
 */
async function getFileFromGitHub(filePath) {
  const url = `${GITHUB_API_URL}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${config.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Update file on GitHub
 */
async function updateFileOnGitHub(filePath, content, sha, commitMessage) {
  const url = `${GITHUB_API_URL}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${config.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      sha: sha,
      branch: config.GITHUB_BRANCH
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Get JSON data from GitHub
 */
async function getJsonDataFromGitHub(filePath) {
  try {
    const fileData = await getFileFromGitHub(filePath);
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    return {
      data: JSON.parse(content),
      sha: fileData.sha
    };
  } catch (error) {
    console.error(`Error getting ${filePath} from GitHub:`, error);
    throw error;
  }
}

/**
 * Save JSON data to GitHub
 */
async function saveJsonDataToGitHub(filePath, jsonData, sha, commitMessage) {
  try {
    const content = JSON.stringify(jsonData, null, 2);
    const result = await updateFileOnGitHub(filePath, content, sha, commitMessage);
    return result;
  } catch (error) {
    console.error(`Error saving ${filePath} to GitHub:`, error);
    throw error;
  }
}

module.exports = {
  getFileFromGitHub,
  updateFileOnGitHub,
  getJsonDataFromGitHub,
  saveJsonDataToGitHub
};