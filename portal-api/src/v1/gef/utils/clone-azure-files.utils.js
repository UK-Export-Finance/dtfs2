const {
  ShareServiceClient,
  StorageSharedKeyCredential
} = require('@azure/storage-file-share');
const dotenv = require('dotenv');

dotenv.config();
const accountName = process.env.AZURE_PORTAL_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_PORTAL_STORAGE_ACCESS_KEY;
const shareName = process.env.AZURE_PORTAL_FILESHARE_NAME;
const rootFolder = process.env.AZURE_PORTAL_EXPORT_FOLDER;
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const serviceClient = new ShareServiceClient(`https://${accountName}.file.core.windows.net`, sharedKeyCredential);
const shareClient = serviceClient.getShareClient(shareName);

/**
 *
 * @param {string} currentApplicationId   | i.e. '1234'
 * @param {string} newApplicationId       | i.e. '1357'
 */

exports.cloneAzureFiles = async (currentApplicationId, newApplicationId) => {
  let copyFromURL = '';
  let newFileName = '';

  let newDirectory = shareClient.getDirectoryClient(`${rootFolder}/${newApplicationId}`);
  await newDirectory.createIfNotExists();

  const existingFolder = serviceClient.getShareClient(shareName).getDirectoryClient(`${rootFolder}/${currentApplicationId}`);

  try {
    const dirIter = existingFolder.listFilesAndDirectories();
    // eslint-disable-next-line no-restricted-syntax
    for await (const item of dirIter) {
      if (item.kind === 'directory') {
        newDirectory = shareClient.getDirectoryClient(`${rootFolder}/${newApplicationId}/${item.name}`);
        await newDirectory.createIfNotExists();

        const subFolders = serviceClient.getShareClient(shareName).getDirectoryClient(`${rootFolder}/${currentApplicationId}/${item.name}`);
        const listSubfolderItems = subFolders.listFilesAndDirectories();

        // eslint-disable-next-line no-restricted-syntax
        for await (const file of listSubfolderItems) {
          if (file.kind === 'file') {
            newFileName = file.name;

            const newServiceClient = ShareServiceClient.fromConnectionString(connectionString);
            const fileClient = newServiceClient.getShareClient(shareName).getDirectoryClient(`${rootFolder}/${newApplicationId}/${item.name}`).getFileClient(newFileName);

            copyFromURL = `https://${accountName}.file.core.windows.net/${shareName}/${rootFolder}/${currentApplicationId}/${item.name}/${newFileName}`;

            fileClient.startCopyFromURL(copyFromURL)
              .then(() => ({ status: 'Success', message: 'File uploaded successfully', newFileName }))
              .catch((err) => ({ status: 'Fail', message: `Unable to upload the selected file ${err}`, newFileName }));
          }
        }
      }
    }
  } catch (error) {
    console.log('The current deal doesn\'t have any supporting information uploaded');
  }
};
