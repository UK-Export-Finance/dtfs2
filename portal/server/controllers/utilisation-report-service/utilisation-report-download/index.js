const stream = require('stream');
const api = require('../../../api');
const { getApiData } = require('../../../helpers');

const getReportDownload = async (req, res) => {
  const { userToken } = req.session;
  const { bankId, _id } = req.params;

  const fileData = await getApiData(api.downloadUtilisationReport(userToken, bankId, _id), res);

  res.set('Content-Disposition', fileData.headers['Content-Disposition']);
  res.set('Content-Type', fileData.headers['Content-Type']);

  const readStream = new stream.PassThrough();
  fileData.pipe(readStream).pipe(res);
};

module.exports = { getReportDownload };
