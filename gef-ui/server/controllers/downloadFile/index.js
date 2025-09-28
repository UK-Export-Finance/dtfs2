const stream = require('stream');
const { downloadFile } = require('../../services/api');

/**
 * Handles file download requests.
 *
 * @async
 * @function generateDownload
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends the file stream or an error response.
 */
const generateDownload = async (req, res) => {
  const {
    params: { fileId },
    query: { filename },
    session: { userToken },
  } = req;

  try {
    const file = await downloadFile({ fileId, userToken });

    if (!file) {
      res.status(404).send('Cannot file file');
      return;
    }

    if (filename) res.set('Content-disposition', `attachment; filename=${filename}`);
    res.set('Content-Type', file.headers['content-type']);

    const readStream = new stream.PassThrough();
    file.pipe(readStream).pipe(res);
  } catch (error) {
    console.error('Error creating download for %s %o', fileId, error);
    res.status(500);
  }
};

module.exports = generateDownload;
