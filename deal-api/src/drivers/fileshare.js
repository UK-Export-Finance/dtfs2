const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');

const { AZURE_WORKFLOW_FILESHARE_CONFIG, AZURE_PORTAL_FILESHARE_CONFIG } = require('../config/fileshare.config');

const getConfig = (fileshare = 'portal') => {
  const config = fileshare === 'workflow'
    ? AZURE_WORKFLOW_FILESHARE_CONFIG
    : AZURE_PORTAL_FILESHARE_CONFIG;
  return config;
};

const getCredentials = async (fileshare = 'portal') => {
  const {
    STORAGE_ACCOUNT, STORAGE_ACCESS_KEY,
  } = getConfig(fileshare);

  const credentials = await new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);

  return credentials;
};

const getShareClient = async (fileshare) => {
  const credentials = await getCredentials(fileshare);
  const { STORAGE_ACCOUNT, FILESHARE_NAME } = getConfig(fileshare);

  const serviceClient = new ShareServiceClient(
    `https://${STORAGE_ACCOUNT}.file.core.windows.net`,
    credentials,
  );

  const shareClient = await serviceClient.getShareClient(FILESHARE_NAME);
  shareClient.create().catch(({ details }) => {
    if (!details) return;
    if (details.errorCode === 'ShareAlreadyExists') return;
    throw new Error(details.message);
  });

  return shareClient;
};

const getExportDirectory = async (fileshare) => {
  const shareClient = await getShareClient(fileshare);
  const { EXPORT_FOLDER } = getConfig(fileshare);

  const exportFolderClient = shareClient.getDirectoryClient(EXPORT_FOLDER);

  await exportFolderClient.create().catch(({ details }) => {
    if (!details) return false;
    if (details.errorCode === 'ResourceAlreadyExists') return false;
    console.error('Fileshare create resource error', details);
    return {
      errorCount: 1,
      error: {
        errorCode: details.errorCode,
        message: details.message,
      },
    };
  });
  return exportFolderClient;
};

const uploadStream = async ({
  fileshare, folder, subfolder = '', filename, buffer,
}) => {
//  const fileStream = new stream.Readable();
//  fileStream.push(buffer);
//  fileStream.push(null);

  const exportDirectory = await getExportDirectory(fileshare);

  const directoryClient = await exportDirectory.getDirectoryClient(folder);

  await directoryClient.create().catch(({ details }) => {
    if (!details) return false;
    if (details.errorCode === 'ResourceAlreadyExists') return false;
    console.error('Fileshare create resource error', details);
    return {
      errorCount: 1,
      error: {
        errorCode: details.errorCode,
        message: details.message,
      },
    };
  });

  const subDirectoryClient = await directoryClient.getDirectoryClient(subfolder);
  await subDirectoryClient.create().catch(({ details }) => {
    if (!details) return false;
    if (details.errorCode === 'ResourceAlreadyExists') return false;
    console.error('Fileshare create resource error', details);
    return {
      error: {
        errorCount: 1,
        errorCode: details.errorCode,
        message: details.message,
      },
    };
  });

  const fileClient = await subDirectoryClient.getFileClient(`${filename}`);
  await fileClient.uploadData(buffer);
  return {
    folder,
    filename: fileClient.name,
    fullPath: fileClient.path,
    url: fileClient.url,
  };
};


const readFile = async ({
  fileshare, folder, subfolder = '', filename,
}) => {
  const exportDirectory = await getExportDirectory(fileshare);
  const directoryClient = await exportDirectory.getDirectoryClient(folder);
  const subDirectoryClient = await directoryClient.getDirectoryClient(subfolder);

  const fileClient = await subDirectoryClient.getFileClient(`${filename}`);

  try {
    const bufferedFile = await fileClient.downloadToBuffer();
    return bufferedFile;
  } catch ({ name, statusCode }) {
    return {
      error: {
        name,
        errorCode: statusCode,
      },
    };
  }
};

const deleteFile = async (filePath) => {
  const shareClient = await getShareClient();

  shareClient.deleteFile(filePath).catch(({ details }) => {
    if (!details) return;
    if (details.errorCode === 'ResourceNotFound') return;
    console.error('Fileshare delete file not found', details);
  });
};

const deleteMultipleFiles = async (fileList) => {
  if (!fileList) return false;
  if (Array.isArray(fileList)) {
    return fileList.map(async (filePath) => {
      await deleteFile(filePath);
    });
  }

  const delFile = await deleteFile(fileList);
  return delFile;
};

module.exports = {
  uploadStream,
  deleteFile,
  deleteMultipleFiles,
  readFile,
};
