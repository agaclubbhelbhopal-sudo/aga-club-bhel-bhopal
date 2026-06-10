// Configuration for GitHub API integration
module.exports = {
  // GitHub repository details
  GITHUB_OWNER: process.env.GITHUB_OWNER || 'your-github-username',
  GITHUB_REPO: process.env.GITHUB_REPO || 'aga-club-app',
  
  // GitHub personal access token (should be set as environment variable in Netlify)
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  
  // Branch to update
  GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
  
  // File paths in the repository
  CONTENT_FILE_PATH: 'content.json',
  MEMBERS_FILE_PATH: 'members.json',
  ADMINS_FILE_PATH: 'admins.json'
};