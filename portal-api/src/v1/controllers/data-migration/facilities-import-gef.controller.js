const db = require('../../../drivers/db-client');

/**
* Import multiple facilities (GEF only)
*/
exports.importFacilities = async (facilities) => {
  const collection = await db.getCollection('facilities');

  const result = await collection.insertMany(facilities);

  return result.insertedIds;
};
