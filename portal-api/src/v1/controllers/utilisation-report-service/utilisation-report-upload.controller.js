// const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
const api = require('../../api');

const uploadReport = async (req, res) => {
  try {
    const { reportData, month, year, user } = req.body;
    const parsedReportData = JSON.parse(reportData);
    const parsedUser = JSON.parse(user);
    const file = req.file;

    if (!file) return res.status(400).send();

    // TODO: FN-967 save file to azure
    // const path = await saveFileToAzure(req.file, month, year, bank);

    const saveDataResponse = await api.saveUtilisationReport(parsedReportData, month, year, parsedUser);

    if (saveDataResponse.status !== 201) {
      const status = saveDataResponse.status || 500;
      console.error('Failed to save utilisation report: %O', saveDataResponse);
      return res.status(status).send({ status, data: 'Failed to save utilisation report' });
    }

    return res.status(200).send({ status: 200, data: 'Successfully saved utilisation report' });
  } catch (error) {
    console.error('Failed to save utilisation report: %O', error);
    return res.status(500).send({ status: 500, data: 'Failed to save utilisation report' });
  }
};

// use azure storage service files or make own
// const saveFileToAzure = async (file, month, year, bank) => {
//   // Use the azure storage file share service client to upload the file
//   const credentials = await new StorageSharedKeyCredential(STORAGE_ACCOUNT, STORAGE_ACCESS_KEY);
//   const serviceClient = new ShareServiceClient(`https://${STORAGE_ACCOUNT}.file.core.windows.net`, credentials);
//   const shareClient = await serviceClient.getShareClient(FILESHARE_NAME);
//   const directoryClient = shareClient.getDirectoryClient(folderPaths);
//   const fileClient = directoryClient.getFileClient(file.originalname);

//   // save the file using the fileshare client
//   await fileClient.create(file.size);
//   await fileClient.uploadRange(file.buffer, 0, file.size);

//   // get back the path and file details to save these details to the database
//   const fileDetails = await fileClient.getProperties();
//   const { fileUrl } = fileDetails._response.request.url;
//   const { fileLastModified } = fileDetails._response.parsedHeaders;
//   const { fileCreationTime } = fileDetails._response.parsedHeaders;
//   const { fileETag } = fileDetails._response.parsedHeaders;
// };

module.exports = { uploadReport };
