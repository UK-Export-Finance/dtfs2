const { mongoDbClient: db } = require('../src/drivers/db-client');
const { DB_COLLECTIONS } = require('./fixtures/constants');

const insertOneUtilisationReportDetails = async (report) => {
  console.info('inserting one utilisation report details');
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.insertOne(report);
};

const insertManyUtilisationReportDetails = async (reports) => {
  console.info('inserting many utilisation report details');
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.insertMany(reports);
};

module.exports = {
  insertOneUtilisationReportDetails,
  insertManyUtilisationReportDetails,
};
