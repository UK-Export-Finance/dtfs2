const db = require('../db-client');
const { DB_COLLECTIONS } = require('./fixtures/constants');

module.exports = (config) => {
  const { dbName, dbConnectionString } = config;
  const connectionOptions = { dbName, dbConnectionString };

  return {
    async insertUtilisationReportDetailsIntoDb(utilisationReportDetails) {
      const utilisationReports = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS, connectionOptions);
      return utilisationReports.insertMany(utilisationReportDetails);
    },
    async removeAllUtilisationReportDetailsFromDb() {
      const utilisationReports = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS, connectionOptions);
      return utilisationReports.deleteMany({});
    },
  };
};
