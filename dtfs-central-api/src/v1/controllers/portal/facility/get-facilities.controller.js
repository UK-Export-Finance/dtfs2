const { ObjectId } = require('mongodb');
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
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('facilities');
    // BSS facilities
    const facilities = await collection.find({ dealId: ObjectId(dealId), $or: [{ type: 'Bond' }, { type: 'Loan' }] }).toArray();
    return facilities;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.findAllFacilitiesByDealId = findAllFacilitiesByDealId;

exports.findAllGet = async (req, res) => {
  const facilities = await findAll();

  return res.status(200).send(facilities);
};
