const { downloadFile, logIn } = require('./api');

module.exports.downloadFile = (deal, opts) => logIn(opts).then((token) => downloadFile(token, deal));
