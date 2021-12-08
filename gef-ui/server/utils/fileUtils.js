const {
  uploadFile, deleteFile, updateApplication, updateSupportingInformation,
} = require('../services/api');

/**
 * Uploads a file to the API, and saves it against the application.
 * Currently configured for supportingInfo section
 *
 * @param {*} files array of files to upload, assumes format from multer
 * @param {*} field field identifier for supplementaryInfo question
 * @param {*} dealId application/deal ID
 * @param {*} token user token
 * @param {*} maxFileSize (optional) maximum file size to allow (defaults to API limits of 10MB otherwise)
 * @returns array of processed files
 */
const uploadAndSaveToDeal = async (files, field, dealId, token, user, maxFileSize, documentPath) => {
  const uploadedFiles = await uploadFile(files, dealId, token, maxFileSize, documentPath);

  return Promise.all(uploadedFiles.map(async (file) => {
    const document = { ...file };

    if (!document.error) {
      await updateSupportingInformation(dealId, document, field);
    }

    return document;
  }));
};

/**
 * Removes a file from the application as well as from the filestore via the API
 *
 * @param {*} filename name of file to remove
 * @param {*} field field identifier for supplementaryInfo question
 * @param {*} deal application/deal object
 * @param {*} token
 */
const removeFileFromDeal = async (filename, field, deal, token) => {
  const existingFiles = deal.supportingInformation?.[field];

  const fileToDelete = existingFiles.find((file) => file.filename === filename);

  // files with errors will not have an ID set so don't need removing further
  if (fileToDelete?._id) {
    await deleteFile(fileToDelete._id, token, field);

    const updatedDeal = { ...deal };
    updatedDeal.supportingInformation[field] = existingFiles.filter((file) => file._id !== fileToDelete._id);

    await updateApplication(updatedDeal._id, updatedDeal);
  }
};

module.exports = {
  uploadAndSaveToDeal,
  removeFileFromDeal,
};
