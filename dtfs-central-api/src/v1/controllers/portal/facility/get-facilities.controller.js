const db = require('../../../../drivers/db-client');

const findAll = async (_id, callback) => {
  const collection = await db.getCollection('facilities');
  const facilities = await collection.find().toArray();

  if (callback) {
    callback(facilities);
  }

  return facilities;
};
exports.findAll = findAll;


const findAllFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection('facilities');
  const facilities = collection.find({ associatedDealId: dealId });
  return facilities.toArray();
};
exports.findAllFacilitiesByDealId = findAllFacilitiesByDealId;

exports.findAllGet = async (req, res) => {
  const facilities = await findAll();

  // if (facilities) {
  return res.status(200).send([
    ...facilities,
  ]);
  // }

  // return res.status(200).send([]);
};
