const fs = require('fs');
const path = require('path');

const folders = [
  'dtfs-central-api',
  'external-api',
  'gef-ui',
  'portal',
  'portal-api',
  'trade-finance-manager-api',
  'trade-finance-manager-ui',
  'utils',
  path.join('azure-functions', 'acbs-function'),
  path.join('libs', 'common'),
];

const basePath = path.join(__dirname, '..', '..');
const baseEnvFilePath = path.join(basePath, '.env');

/**
 * Due to our current setup, the .env on the root on the project
 * requires a slightly different setup than the .env that are copied to
 * the .env that are used in the docker files
 *
 * This function updates the .env file to apply these rules
 * @param {string} fileData
 * @returns {string}
 */
const updateEnvVars = (fileData) =>
  fileData
    .split('\n')
    .map((currentLine) => {
      if (currentLine.includes('MONGODB_URI=') || currentLine.includes('MONGODB_URI_QA=')) {
        return currentLine.replace('dtfs-submissions-data', 'localhost');
      }
      if (currentLine.includes('SQL_DB_HOST=')) {
        return currentLine.replace('dtfs-sql', 'localhost');
      }
      return currentLine;
    })
    .join('\n');

const copyEnvFileToFolder = (folderPathToCopyTo) => {
  try {
    const envFileData = fs.readFileSync(baseEnvFilePath, 'utf8');
    const newEnvFileData = updateEnvVars(envFileData);

    const envVarPathToCopyTo = path.join(basePath, folderPathToCopyTo, '.env');
    fs.writeFileSync(envVarPathToCopyTo, newEnvFileData);
    console.info(`.env file copied to ${folderPathToCopyTo}`);
  } catch (error) {
    console.error(`Error copying .env file to ${folderPathToCopyTo}: ${error.message}`);
  }
};

folders.forEach(copyEnvFileToFolder);

console.info('Done!');
