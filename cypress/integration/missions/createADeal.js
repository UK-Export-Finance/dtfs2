const pages = require('../pages');
const passRedLine = require('./passRedLine');

module.exports = (opts) => {
  passRedLine(opts);

  pages.bankDetails.bankDealId().type(opts.bankDealId);
  pages.bankDetails.bankDealName().type(opts.bankDealName);
  pages.bankDetails.submit().click();

}
