const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
const stream = require('stream');

const fileshareName = 'ukef';
const AZURE_STORAGE_ACCOUNT = 'dtfsmediaserver';
const AZURE_STORAGE_ACCESS_KEY = '98DED/hkaR6GHfPauH9h1u+YMSG4FQThsIzQDJoFmTf2uHocIbq+ruyDAbkzXas3E/ilbcQS8sYBzvQx0qnUhw==';

const credential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);
const serviceClient = new ShareServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT}.file.core.windows.net`,
  credential,
);

const shareClient = serviceClient.getShareClient(fileshareName);
shareClient.create().catch(({ details }) => {
  if (!details) return;
  if (details.errorCode === 'ShareAlreadyExists') return;
  throw new Error(details.message);
});

const FILESHARE_URL = `${shareClient.url}/`;

const uploadStream = async ({
  folder, subfolder, filename, buffer,
}) => {
  const fileStream = new stream.Readable();
  fileStream.push(buffer);
  fileStream.push(null);


  const directoryClient = await shareClient.getDirectoryClient(folder);
  await directoryClient.create().catch(({ details }) => {
    if (!details) return;
    if (details.errorCode === 'ResourceAlreadyExists') return;
    console.error('Fileshare create resource error', details);
  });

  const subDirectoryClient = await directoryClient.getDirectoryClient(subfolder);
  await subDirectoryClient.create().catch(({ details }) => {
    if (!details) return;
    if (details.errorCode === 'ResourceAlreadyExists') return;
    console.error('Fileshare create resource error', details);
  });

  const fileClient = await subDirectoryClient.getFileClient(`${filename}`);
  await fileClient.uploadStream(fileStream, buffer.length, 4 * 1024 * 1024, 20);

  return {
    folder,
    subfolder,
    filename,
    fullPath: `${folder}/${subfolder}/${filename}`,
  };
};

const readFile = async ({
  folder, subfolder, filename, stringEncoding = 'utf-8',
}) => {
  const directoryClient = await shareClient.getDirectoryClient(folder);
  const subDirectoryClient = await directoryClient.getDirectoryClient(subfolder);
  const fileClient = await subDirectoryClient.getFileClient(`${filename}`);
  const bufferedFile = await fileClient.downloadToBuffer();
  return bufferedFile.toString(stringEncoding);
};

const deleteFile = async (filePath) => shareClient.deleteFile(filePath).catch(({ details }) => {
  if (!details) return;
  if (details.errorCode === 'ResourceNotFound') return;
  console.error('Fileshare delete file not found', details);
});

module.exports = {
  uploadStream,
  deleteFile,
  readFile,
  FILESHARE_URL,
};
