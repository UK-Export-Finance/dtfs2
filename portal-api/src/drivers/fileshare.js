const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');

const { AZURE_PORTAL_FILESHARE_CONFIG } = require('../config/fileshare.config');

let userDefinedConfig;

const setConfig = (fileshareConfig) => {
  userDefinedConfig = fileshareConfig;
};

const getConfig = () => {
  const config = AZURE_PORTAL_FILESHARE_CONFIG;
  return userDefinedConfig || config;
};

const getCredentials = async () => {
  const { STORAGE_ACCOUNT, STORAGE_ACCESS_KEY } = getConfig();

  const credentials = await new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);

  return credentials;
};

const getShareClient = async () => {
  const credentials = await getCredentials();
  const { STORAGE_ACCOUNT, FILESHARE_NAME } = getConfig();
  const serviceClient = new ShareServiceClient(`https://${STORAGE_ACCOUNT}.file.core.windows.net`, credentials);

  if (process.env.AZURE_LOG_LEVEL) {
    console.info('get Share props');
    const shareProps = await serviceClient.getProperties();
    console.info({ shareProps });
  }

  const shareClient = await serviceClient.getShareClient(FILESHARE_NAME);

  await shareClient.create().catch(({ details }) => {
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

const uploadFile = async ({ fileshare, folder, filename, buffer, allowOverwrite }) => {
  const directoryClient = await getDirectory(fileshare, folder);

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

const readFile = async ({ fileshare, folder = '', filename }) => {
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
  const shareClient = await getShareClient();

  await shareClient.deleteFile(filePath).catch(() => {});
};

const deleteMultipleFiles = (fileshare, filePath, fileList) => {
  if (!fileList) return false;

  if (Array.isArray(fileList)) {
    return fileList.map(async (filename) => {
      await deleteFile(fileshare, `${filePath}/${filename}`);
    });
  }

  return deleteFile(fileshare, `${filePath}/${fileList}`);
};

const deleteDirectory = async (fileshare, folder) => {
  const shareClient = await getShareClient();
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
