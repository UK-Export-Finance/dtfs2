const stream = require('stream');
const fileshare = require('../../../drivers/fileshare');
const api = require('../../api');
const { FILESHARES } = require('../../../constants/file-upload');

/**
 * Fetches metadata about the utilisation report file associated with the
 * specified id and bankId
 * @param bankId {string} - the id of the bank
 * @param id {number} - the SQL id of the report
 * @returns {Promise<{ filename: string; mimetype: string }>}
 */
const getUtilisationReportFileMetadata = async (bankId, id) => {
  const response = await api.getUtilisationReportById(id);
  const { azureFileInfo, bankId: reportBankId } = response;

  if (reportBankId !== bankId) {
    throw new Error(`Failed to find utilisation report with bankId ${bankId} and report id ${id}`);
  }

  if (!azureFileInfo?.filename) {
    throw new Error(`Failed to get filename for utilisation report with id '${id}'`);
  }

  if (!azureFileInfo?.mimetype) {
    throw new Error(`Failed to get mimetype for utilisation report with id '${id}'`);
  }

  const { filename, mimetype } = azureFileInfo;
  return { filename, mimetype };
};

const getReportDownload = async (req, res) => {
  const { bankId, id } = req.params;

  try {
    const { filename, mimetype } = await getUtilisationReportFileMetadata(bankId, Number(id));

    const bufferedFile = await fileshare.readFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder: bankId,
      filename,
    });

    if (bufferedFile.error) {
      const errorMessage = `Failed to get utilisation report for download with id '${id}' from Azure Storage`;
      console.error(errorMessage, bufferedFile.error);
      return res.status(500).send(errorMessage);
    }

    const readStream = new stream.PassThrough();
    readStream.end(bufferedFile);

    res.set('content-disposition', `attachment; filename=${filename}`);
    res.set('content-type', mimetype);

    return readStream.pipe(res);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report for download with id '${id}'`;
    console.error(errorMessage, error);
    return res.status(error.response?.status ?? 500).send({ message: errorMessage });
  }
};

module.exports = { getReportDownload };
