import fs from 'fs';
import path from 'path';

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
 */
const updateEnvVars = (fileData: string): string => {
  const MONGODB_URI_REGEX = /(MONGODB_URI=.*)(dtfs-mongo)/g;
  const SQL_DB_HOST_REGEX = /(SQL_DB_HOST=.*)(dtfs-sql)/g;

  const replacePattern = '$1localhost';

  const regexPatternsToApply = [MONGODB_URI_REGEX, SQL_DB_HOST_REGEX];

  return regexPatternsToApply.reduce((updatedFileData, regexPattern) => updatedFileData.replace(regexPattern, replacePattern), fileData);
};

/**
 * Copies the .env file from root to all required folders.
 * When needed, it changes certain env vars as needed for docker
 */
const copyEnvFileToFolders = () => {
  try {
    const envFileData = fs.readFileSync(baseEnvFilePath, 'utf8');
    const newEnvFileData = updateEnvVars(envFileData);

    folders.forEach((folderPathToCopyTo: string) => {
      try {
        const envVarPathToCopyTo = path.join(basePath, folderPathToCopyTo, '.env');
        fs.writeFileSync(envVarPathToCopyTo, newEnvFileData);
        console.info('.env file copied to %s', folderPathToCopyTo);
      } catch (error) {
        console.error('Error while copying .env file to %s %o', folderPathToCopyTo, error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error copying env vars:', error);
  }
};

copyEnvFileToFolders();

console.info('✅ Done!');
