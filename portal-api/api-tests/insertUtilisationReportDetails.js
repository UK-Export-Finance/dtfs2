const db = require('../src/drivers/db-client');
const { DB_COLLECTIONS } = require('./fixtures/constants');

const insertOneUtilisationReportDetails = async (utilisationReport) => {
  console.info('inserting one utilisation report details');
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.insertOne(utilisationReport);
};

const insertManyUtilisationReportDetails = async (utilisationReports) => {
  console.info('inserting many utilisation report details');
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.insertMany(utilisationReports);
};

module.exports = {
  insertOneUtilisationReportDetails,
  insertManyUtilisationReportDetails,
};
