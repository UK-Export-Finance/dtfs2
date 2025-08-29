const stream = require('stream');
const api = require('../../../api');

/**
 * Fetches a utilisation report CSV file for download
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getReportDownload = async (req, res) => {
  try {
    const { userToken } = req.session;
    const { bankId, id } = req.params;

    const { data, headers } = await api.downloadUtilisationReport(userToken, bankId, id);

    res.set('content-disposition', headers['content-disposition']);
    res.set('content-type', headers['content-type']);

    const readStream = new stream.PassThrough();
    data.pipe(readStream).pipe(res);
  } catch (error) {
    console.error('Failed to download utilisation report', error);
    res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

module.exports = { getReportDownload };
