const { uploadFile, deleteFile, updateApplication, updateSupportingInformation } = require('../services/api');

/**
 * Uploads a file to the API, and saves it against the application.
 * Currently configured for supportingInfo section
 *
 * @param {array} files array of files to upload, assumes format from multer
 * @param {string} field field identifier for supplementaryInfo question
 * @param {string} dealId application/deal ID
 * @param {string} userToken user token
 * @param {number} maxFileSize maximum file size to allow (defaults to API limits of 10MB otherwise)
 * @param {string} documentPath full document path (i.e. manualInclusion)
 * @returns array of processed files
 */
const uploadAndSaveToDeal = async (files, field, dealId, userToken, user, maxFileSize, documentPath) => {
  const uploadedFiles = await uploadFile({
    files,
    id: dealId,
    userToken,
    maxSize: maxFileSize,
    documentPath,
  });

  return Promise.all(
    uploadedFiles.map(async (file) => {
      const document = { ...file };

      if (!document.error) {
        await updateSupportingInformation({
          dealId,
          application: document,
          field,
          user,
          userToken,
        });
      }

      return document;
    }),
  );
};

/**
 * Removes a file from the application as well as from the filestore via the API
 *
 * @param {*} filename name of file to remove
 * @param {*} field field identifier for supplementaryInfo question
 * @param {*} deal application/deal object
 * @param {*} userToken
 */
const removeFileFromDeal = async (filename, field, deal, userToken, user) => {
  const existingFiles = deal.supportingInformation?.[field];

  const fileToDelete = existingFiles.find((file) => file.filename === filename);

  // files with errors will not have an ID set so don't need removing further
  if (fileToDelete?._id) {
    await deleteFile({ fileId: fileToDelete._id, userToken, documentPath: field });

    const updatedDeal = { ...deal };
    updatedDeal.supportingInformation[field] = existingFiles.filter((file) => file._id !== fileToDelete._id);
    updatedDeal.editorId = user._id;
    await updateApplication({ dealId: updatedDeal._id, application: updatedDeal, userToken });
  }
};

module.exports = {
  uploadAndSaveToDeal,
  removeFileFromDeal,
};
