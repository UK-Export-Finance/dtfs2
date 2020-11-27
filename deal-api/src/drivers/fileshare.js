const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');

const { AZURE_WORKFLOW_FILESHARE_CONFIG, AZURE_PORTAL_FILESHARE_CONFIG } = require('../config/fileshare.config');

let userDefinedConfig;

const setConfig = (fileshareConfig) => {
  userDefinedConfig = fileshareConfig;
};

const getConfig = (fileshare = 'portal') => {
  const config = fileshare === 'workflow'
    ? AZURE_WORKFLOW_FILESHARE_CONFIG
    : AZURE_PORTAL_FILESHARE_CONFIG;
  return userDefinedConfig || config;
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
  console.log('getShareCLient', { FILESHARE_NAME, URI: `https://${STORAGE_ACCOUNT}.file.core.windows.net`, credentials });
  const shareClient = await serviceClient.getShareClient(FILESHARE_NAME);
  shareClient.create().catch(({ details }) => {
    if (!details) return;
    if (details.errorCode === 'ShareAlreadyExists') return;
    throw new Error(details.message);
  });

  return shareClient;
};

const getDirectory = async (fileshare, folderPaths = '') => {
  const shareClient = await getShareClient(fileshare);

  const directoryClient = shareClient.getDirectoryClient(folderPaths);

  await directoryClient.create().catch(async ({ details }) => {
    if (!details) return false;
    if (details.errorCode === 'ResourceAlreadyExists') return false;
    if (details.errorCode === 'ParentNotFound') {
      const parentFolder = folderPaths.replace(/(\/[^/]*)\/?$/, ''); // remove last folder from string
      await getDirectory(fileshare, parentFolder);
      return false;
    }

    return {
      errorCount: 1,
      error: {
        errorCode: details.errorCode,
        message: details.message,
      },
    };
  });
  return directoryClient;
};

const uploadFile = async ({
  fileshare, folder, filename, buffer, allowOverwrite,
}) => {
  // const exportDirectory = await getExportDirectory(fileshare);

  // const directoryClient = await exportDirectory.getDirectoryClient(folder);

  const directoryClient = await getDirectory(fileshare, folder);
  console.log({ directoryClient });
  await directoryClient.create().catch(({ details }) => {
    if (!details) return false;
    if (details.errorCode === 'ResourceAlreadyExists') return false;
    console.error('Fileshare create resource error', { fileshare, folder, details });
    return {
      errorCount: 1,
      error: {
        errorCode: details.errorCode,
        message: details.message,
      },
    };
  });

  const fileClient = await directoryClient.getFileClient(`${filename}`);
  console.log({ fileClient });
  const existingFileProps = await fileClient.getProperties().catch(() => {});

  if (existingFileProps && allowOverwrite) {
    await fileClient.delete();
  }

  if (!existingFileProps || allowOverwrite) {
    await fileClient.uploadData(buffer);
    return {
      folder,
      filename: fileClient.name,
      fullPath: fileClient.path,
      url: fileClient.url,
    };
  }

  return {
    error: {
      message: 'could not be uploaded. Each file must have unique filename',
    },
  };
};


const readFile = async ({
  fileshare, folder = '', filename,
}) => {
  const directory = await getDirectory(fileshare, folder);

  const fileClient = await directory.getFileClient(`${filename}`);

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

const deleteFile = async (fileshare, filePath) => {
  const shareClient = await getShareClient(fileshare);

  await shareClient.deleteFile(filePath).catch(() => {});
};

const deleteMultipleFiles = async (fileshare, fileList) => {
  if (!fileList) return false;

  if (Array.isArray(fileList)) {
    return fileList.map(async (filePath) => {
      await deleteFile(fileshare, filePath);
    });
  }

  return deleteFile(fileshare, fileList);
};

const deleteDirectory = async (fileshare, folder) => {
  const shareClient = await getShareClient(fileshare);
  const deleteDir = await shareClient.deleteDirectory(folder);
  return deleteDir;
};

const copyFile = async ({ from, to }) => {
  const fromFile = {
    fileshare: from.fileshare,
    folder: from.folder,
    filename: from.filename,
  };

  const bufferedFile = await readFile(fromFile);
  if (bufferedFile.error) {
    return bufferedFile;
  }

  const toFile = {
    fileshare: to.fileshare,
    folder: to.folder,
    filename: to.filename,
    buffer: bufferedFile,
  };

  const uploadedFile = await uploadFile(toFile);
  return uploadedFile;
};

const moveFile = async ({ from, to }) => {
  const filePath = `${from.folder}/${from.filename}`;

  const copied = await copyFile({ from, to });

  if (copied.error) {
    return Promise.reject(new Error(`${filePath}: ${JSON.stringify(copied.error)}`));
  }
  await deleteFile(from.fileshare, filePath);
  return copied;
};

const listDirectoryFiles = async ({ fileshare, folder }) => {
  const directoryClient = await getDirectory(fileshare, folder);

  const directoryList = [];
  const iter = await directoryClient.listFilesAndDirectories();

  if (!iter) {
    return false;
  }

  let entity = await iter.next();

  while (!entity.done) {
    directoryList.push(entity.value);
    entity = await iter.next(); // eslint-disable-line no-await-in-loop
  }

  return directoryList;
};

module.exports = {
  setConfig,
  getConfig,
  getDirectory,
  uploadFile,
  deleteFile,
  deleteMultipleFiles,
  deleteDirectory,
  readFile,
  copyFile,
  moveFile,
  listDirectoryFiles,
};
