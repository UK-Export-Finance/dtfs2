/* eslint-disable no-restricted-syntax */
const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
const dotenv = require('dotenv');
const db = require('../../../drivers/db-client');

dotenv.config();

// V2 storage account
const {
  AZURE_PORTAL_STORAGE_ACCOUNT: v2AccountName,
  AZURE_PORTAL_STORAGE_ACCESS_KEY: v2AccountKey,
  AZURE_PORTAL_FILESHARE_NAME: v2ShareName,
  AZURE_PORTAL_EXPORT_FOLDER: v2RootFolder,
} = process.env;
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${v2AccountName};AccountKey=${v2AccountKey};EndpointSuffix=core.windows.net`;
const sharedKeyCredential = new StorageSharedKeyCredential(v2AccountName, v2AccountKey);
const serviceClient = new ShareServiceClient(`https://${v2AccountName}.file.core.windows.net`, sharedKeyCredential);
const shareClient = serviceClient.getShareClient(v2ShareName);

// V1 storage account
const {
  V1_FILE_SHARE_SAS: v1SharedAccessSignature,
  V1_FILE_SHARE_ACCOUNT: v1AccountName,
  V1_AZURE_PORTAL_FILESHARE_NAME: v1ShareName,
  V1_AZURE_PORTAL_EXPORT_FOLDER: v1RootFolder,
} = process.env;

/**
 * Clone Azure files from PortalV1 to PortalV2
 */
exports.cloneAzureFilesGef = async (supportingInformation, dealId) => {
  const documentPaths = Object.keys(supportingInformation);
  let copyFromURL = '';
  let newFileName = '';

  let newDirectory = shareClient.getDirectoryClient(`${v2RootFolder}/${dealId}`);
  await newDirectory.createIfNotExists();
  const newServiceClient = ShareServiceClient.fromConnectionString(connectionString);

  if (supportingInformation && Object.keys(supportingInformation).length) {
    try {
      for await (const document of documentPaths) {
        if (document !== 'security') {
          newDirectory = shareClient.getDirectoryClient(`${v2RootFolder}/${dealId}/${document}`);
          await newDirectory.createIfNotExists();
          const dealsCollection = await db.getCollection('deals');
          try {
            await dealsCollection.updateOne({ _id: dealId }, { $set: { [`supportingInformation.${document}.$[].parentId`]: dealId.toHexString() } });
          } catch (error) {
            console.error(`Unable to update the deal ${dealId}`, error);
          }

          for (const item of supportingInformation[document]) {
            newFileName = item.filename;
            const fileClient = newServiceClient
              .getShareClient(v2ShareName)
              .getDirectoryClient(`${v2RootFolder}/${dealId}/${document}`)
              .getFileClient(newFileName);

            copyFromURL = `https://${v1AccountName}.file.core.windows.net/${v1ShareName}/${v1RootFolder}/${item.v1Url}${v1SharedAccessSignature}`;

            fileClient
              .startCopyFromURL(copyFromURL)
              .then(() => {
                console.info(`File ${newFileName} was uploaded successfully`);
                return { status: 200 };
              })
              .catch((err) => {
                console.info(`Unable to upload the selected file ${err}`, newFileName);
                return { status: 400 };
              });
          }
        }
      }
    } catch (error) {
      console.error(error);
      return { status: 400 };
    }
  } else {
    return { status: 200 };
  }
};
