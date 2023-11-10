const db = require('../src/drivers/db-client');
const { DB_COLLECTIONS } = require('./fixtures/constants');

const insertOneUtilisationReportDetails = async (report) => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  await collection.insertOne(report);
};

const insertManyUtilisationReportDetails = async (reports) => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  await collection.insertMany(reports);
};

module.exports = {
  insertOneUtilisationReportDetails,
  insertManyUtilisationReportDetails,
};
