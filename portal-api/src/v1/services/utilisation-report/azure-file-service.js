const { FILESHARES } = require('../../../constants');
const { uploadFile } = require('../../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../../utils');

/**
 * Saves file to Azure in utilisation-reports ShareClient, returns the file storage info
 * @param {Object} file
 * @param {string} bankId - bank id as a string
 * @returns {Promise<object>} - azure storage details with folder, file name, full path, url and mimetype.
 */
export const saveUtilisationReportFileToAzure = async (file, bankId) => {
  try {
    console.info(`Attempting to save utilisation report to Azure for bank: ${bankId}`);
    const { originalname, buffer } = file;

    const fileInfo = await uploadFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder: bankId,
      filename: formatFilenameForSharepoint(originalname),
      buffer,
      allowOverwrite: true,
    });

    if (!fileInfo || fileInfo.error) {
      throw new Error(`Failed to save utilisation report to Azure - ${fileInfo?.error?.message ?? 'cause unknown'}`);
    }

    console.info(`Successfully saved utilisation report to Azure for bank: ${bankId}`);
    return {
      ...fileInfo,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error('Failed to save utilisation report to Azure ', error);
    throw error;
  }
};
