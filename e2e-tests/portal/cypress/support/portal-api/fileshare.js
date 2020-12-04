const {downloadFile,logIn} = require('./api');

module.exports.downloadFile = (deal, opts) => {
  return logIn(opts).then( (token) => {
      return downloadFile(token, deal);
  })
}
