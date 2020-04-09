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


const uploadStream = async (folder, { fieldname: subfolder, originalname: filename, buffer }) => {
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

module.exports = {
  uploadStream,
};
