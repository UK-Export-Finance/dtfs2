const {
  ShareServiceClient,
  StorageSharedKeyCredential
} = require('@azure/storage-file-share');
const dotenv = require('dotenv');

dotenv.config();

const V1_FILESHARE = {
  accountName: process.env.AZURE_V1_PORTAL_STORAGE_ACCOUNT,
  accountKey: process.env.AZURE_V1_PORTAL_STORAGE_ACCESS_KEY,
  shareName: process.env.AZURE_V1_PORTAL_FILESHARE_NAME,
  rootFolder: process.env.AZURE_V1_PORTAL_EXPORT_FOLDER,
  connectionString: `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`,
};

V1_FILESHARE.sharedKeyCredential = new StorageSharedKeyCredential(V1_FILESHARE.accountName, V1_FILESHARE.accountKey);
V1_FILESHARE.serviceClient = new ShareServiceClient(`https://${V1_FILESHARE.accountName}.file.core.windows.net`, V1_FILESHARE.sharedKeyCredential);
V1_FILESHARE.shareClient = V1_FILESHARE.serviceClient.getShareClient(V1_FILESHARE.shareName);

const V2_FILESHARE = {
  accountName: process.env.AZURE_PORTAL_STORAGE_ACCOUNT,
  accountKey: process.env.AZURE_PORTAL_STORAGE_ACCESS_KEY,
  shareName: process.env.AZURE_PORTAL_FILESHARE_NAME,
  rootFolder: process.env.AZURE_PORTAL_EXPORT_FOLDER,
  connectionString: `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`,
};

V2_FILESHARE.sharedKeyCredential = new StorageSharedKeyCredential(V2_FILESHARE.accountName, V2_FILESHARE.accountKey);
V2_FILESHARE.serviceClient = new ShareServiceClient(`https://${V2_FILESHARE.accountName}.file.core.windows.net`, V2_FILESHARE.sharedKeyCredential);
V2_FILESHARE.shareClient = V2_FILESHARE.serviceClient.getShareClient(V2_FILESHARE.shareName);

const migrateDealFiles = (v1DealId, v2DealId, filesArray) => {
  if (filesArray.length) {
    console.log('v1Url ', v1Url);

    // create v2 directory
    let newDirectory = V2_FILESHARE.shareClient.getDirectoryClient(`${V2_FILESHARE.rootFolder}/${v2DealId}`);
    await newDirectory.createIfNotExists();

    // get v1 directory/folder
    const existingFolder = serviceClient.getShareClient(shareName).getDirectoryClient(`${V2_FILESHARE.rootFolder}/${v1DealId}`);

    // get v1 file
    const listSubfolderItems = existingFolder.listFilesAndDirectories();

    // eslint-disable-next-line no-restricted-syntax
    for await (const file of listSubfolderItems) {
      if (file.kind === 'file') {
        newFileName = file.name;

        // copy to v2
        const newServiceClient = ShareServiceClient.fromConnectionString(V2_FILESHARE.connectionString);
        const v2FileClient = newServiceClient.getShareClient(V2_FILESHARE.shareName).getDirectoryClient(`${V2_FILESHARE.rootFolder}/${v2DealId}/${item.name}`).getFileClient(newFileName);

        copyFromURL = `https://${accountName}.file.core.windows.net/${shareName}/${rootFolder}/${v1DealId}/${item.name}/${newFileName}`;

        v2FileClient.startCopyFromURL(copyFromURL)
          .then(() => ({ status: 'Success', message: 'File uploaded successfully', newFileName }))
          .catch((err) => ({ status: 'Fail', message: `Unable to upload the selected file ${err}`, newFileName }));
      }
    };
  }
};


module.exports = migrateDealFiles;
