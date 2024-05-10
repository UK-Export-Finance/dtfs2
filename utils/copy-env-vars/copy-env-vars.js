const fs = require('fs');
const path = require('path');

const folders = [
  'dtfs-central-api',
  'external-api',
  'gef-ui',
  'portal',
  'portal-api',
  'secrets',
  'trade-finance-manager-api',
  'trade-finance-manager-ui',
  path.join('utils', 'mock-data-loader'),
  path.join('e2e-tests', 'tfm'),
  path.join('e2e-tests', 'gef'),
  path.join('e2e-tests', 'portal'),
  path.join('e2e-tests', 'ukef'),
];

const basePath = path.join(__dirname, '..', '..');
const baseEnvFilePath = path.join(basePath, '.env');

const updateMongoDbUri = (fileData) => {
  return fileData
    .split('\n')
    .map((currentLine) =>
      currentLine.includes('MONGODB_URI=') ? currentLine.replace('dtfs-submissions-data', 'localhost') : currentLine,
    )
    .join('\n');
};

const copyEnvFileToFolder = (folderPathToCopyTo) => {
  try {
    const envFileData = fs.readFileSync(baseEnvFilePath, 'utf8');
    const newEnvFileData = updateMongoDbUri(envFileData);

    const envVarPathToCopyTo = path.join(basePath, folderPathToCopyTo, '.env');
    fs.writeFileSync(envVarPathToCopyTo, newEnvFileData);
    console.log(`.env file copied to ${folderPathToCopyTo}`);
  } catch (error) {
    console.error(`Error copying .env file to ${folderPathToCopyTo}: ${error.message}`);
  }
};

folders.forEach(copyEnvFileToFolder);

console.log('Done!');
