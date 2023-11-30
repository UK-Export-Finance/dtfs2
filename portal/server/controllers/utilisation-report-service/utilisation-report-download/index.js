const stream = require('stream');
const api = require('../../../api');

/**
 * Fetches a utilisation report DSV file for download
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getReportDownload = async (req, res) => {
  try {
    const { userToken } = req.session;
    const { bankId, _id } = req.params;

    const { data, headers } = await api.downloadUtilisationReport(userToken, bankId, _id);

    res.set('content-disposition', headers['content-disposition']);
    res.set('content-type', headers['content-type']);

    const readStream = new stream.PassThrough();
    data.pipe(readStream).pipe(res);
  } catch (error) {
    const errorMessage = 'Failed to download utilisation report';
    console.error(errorMessage, error);
    res.status(error.response?.status ?? 500).send({ message: errorMessage });
  }
};

module.exports = { getReportDownload };
