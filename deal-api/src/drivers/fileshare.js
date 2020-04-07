const azure = require('azure-storage');
const stream = require('stream');

const fileshare = 'ukef';
const AZURE_STORAGE_ACCOUNT = 'dtfsmediaserver';
const AZURE_STORAGE_ACCESS_KEY = '98DED/hkaR6GHfPauH9h1u+YMSG4FQThsIzQDJoFmTf2uHocIbq+ruyDAbkzXas3E/ilbcQS8sYBzvQx0qnUhw==';

const uploadStream = async (folder, { fieldname, originalname, buffer }) => {
  const fileStream = new stream.Readable();
  fileStream.push(buffer);
  fileStream.push(null);
  console.log('uploadStream');
  const fileService = azure.createFileService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);

  await fileService.createShareIfNotExists(fileshare, (error, result, response) => {
    if (!error) {
    }
  });

  await fileService.createDirectoryIfNotExists(fileshare, folder, (error, result, response) => {
    if (!error) {
    } else {
      console.log({ error });
    }
  });

  const result = await fileService.createFileFromStream(fileshare, folder, `${fieldname}-${originalname}`, fileStream, buffer.length, (error, result, response) => {
    if (!error) {
      // file uploaded
      console.log({ result });
    }
  });

  return result;
};

module.exports = {
  uploadStream,
};
