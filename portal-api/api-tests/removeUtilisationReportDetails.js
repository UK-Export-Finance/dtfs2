const db = require('../src/drivers/db-client');
const { DB_COLLECTIONS } = require('./fixtures/constants');

const removeAllUtilisationReportDetails = async () => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  await collection.deleteMany({});
};

module.exports = {
  removeAllUtilisationReportDetails,
};
