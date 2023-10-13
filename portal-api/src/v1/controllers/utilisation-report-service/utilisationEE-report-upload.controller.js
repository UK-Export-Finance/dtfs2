const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');

const uploadReport = async (req, res) => {
    const { report_data, month, year, bank} = req.body;
    const file = req.file;

    // Check file exists
    if (!file) return res.status(404).send();

    // validate month, year, bank

    // validate and cleanse report data of any unnecessary data

    // save file to azure
    await saveFileToAzure(req.file, month, year, bank);

    // save utilisation data to database
    await saveUtilisationData(report_data, month, year, bank);

    // save report details to database
    await saveReportDetails(file, month, year, bank);
};

const saveUtilisationData = async (report_data, month, year, bank) => {
    
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
}