const fileshareAzure = require('../../../deal-api/src/drivers/fileshare');

module.exports = {
  ...fileshareAzure,
  dealDir: 'private-files/ukef_migration_export',
};
