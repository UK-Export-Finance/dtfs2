const stream = require('stream');
const fileshare = require('../../../drivers/fileshare');
const api = require('../../api');
const { FILESHARES } = require('../../../constants/file-upload');

/**
 * Fetches metadata about the utilisation report file associated with the
 * specified MongoDB _id
 * @param _id {string} - the MongoDB _id of the report
 * @returns {Promise<{ filename: string; mimetype: string }>}
 */
const getUtilisationReportFileMetadata = async (_id) => {
  const { azureFileInfo } = await api.getUtilisationReportById(_id);

  if (!azureFileInfo?.filename) {
    throw new Error(`Failed to get filename for utilisation report with _id '${_id}'`);
  }

  if (!azureFileInfo?.mimetype) {
    throw new Error(`Failed to get mimetype for utilisation report with _id '${_id}'`);
  }

  const { filename, mimetype } = azureFileInfo;
  return { filename, mimetype };
};

const getReportDownload = async (req, res) => {
  const { bankId, _id } = req.params;

  try {
    const { filename, mimetype } = await getUtilisationReportFileMetadata(_id);

    const bufferedFile = await fileshare.readFile({
      fileshare: FILESHARES.UTILISATION_REPORTS,
      folder: bankId,
      filename,
    });

    if (bufferedFile.error) {
      console.error(`Failed to get utilisation report for download with _id '${_id}' from Azure Storage`, bufferedFile.error);
      return res.status(404).send();
    }

    const readStream = new stream.PassThrough();
    readStream.end(bufferedFile);

    res.set('Content-Disposition', `attachment; filename=${filename}`);
    res.set('Content-Type', mimetype);

    return readStream.pipe(res);
  } catch (error) {
    const errorMessage = `Failed to get utilisation report for download with _id '${_id}'`;
    console.error(errorMessage, error);
    return res.status(error.response?.status ?? 500).send({ message: errorMessage });
  }
};

module.exports = { getReportDownload };
