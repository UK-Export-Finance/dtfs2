const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
const api = require('../../api');

const uploadReport = async (req, res) => {
  console.log(req);
  const { report_data, month, year, bank, user } = req.body;
  const file = req.file;

  // Check file exists
  if (!file) return res.status(404).send();

  // save file to azure
  const path = await saveFileToAzure(req.file, month, year, bank);

  // save utilisation data to database
  await api.saveUtilisationReport(report_data, month, year, bank, user, path);

  // if no errors return 200, else return 500
  return res.status(200).send('Successfully saved utilisation report');
};

const saveFileToAzure = async (file, month, year, bank) => {
  // Use the azure storage file share service client to upload the file
  const credentials = await new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);
  const serviceClient = new ShareServiceClient(`https://${STORAGE_ACCOUNT}.file.core.windows.net`, credentials);
  const shareClient = await serviceClient.getShareClient(FILESHARE_NAME);
  const directoryClient = shareClient.getDirectoryClient(folderPaths);
  const fileClient = directoryClient.getFileClient(file.originalname);

  // save the file using the fileshare client
  await fileClient.create(file.size);
  await fileClient.uploadRange(file.buffer, 0, file.size);

  // get back the path and file details to save these details to the database
  const fileDetails = await fileClient.getProperties();
  const { fileUrl } = fileDetails._response.request.url;
  const { fileLastModified } = fileDetails._response.parsedHeaders;
  const { fileCreationTime } = fileDetails._response.parsedHeaders;
  const { fileETag } = fileDetails._response.parsedHeaders;
};

module.exports = { uploadReport };
