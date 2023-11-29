const stream = require('stream');
const api = require('../../../api');

const getReportDownload = async (req, res) => {
  const { userToken } = req.session;
  const { bankId, _id } = req.params;

  const { data, headers } = await api.downloadUtilisationReport(userToken, bankId, _id);

  res.set('content-disposition', headers['content-disposition']);
  res.set('content-type', headers['content-type']);

  const readStream = new stream.PassThrough();
  data.pipe(readStream).pipe(res);
};

module.exports = { getReportDownload };
