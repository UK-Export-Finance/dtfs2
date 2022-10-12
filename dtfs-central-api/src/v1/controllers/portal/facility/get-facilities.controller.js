const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');

const facilitiesCollection = 'facilities';

const findAllBssFacilitiesByDealId = async (dealId) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(facilitiesCollection);
    // BSS facilities
    const facilities = await collection.find({ dealId: ObjectId(dealId), $or: [{ type: 'Bond' }, { type: 'Loan' }] }).toArray();
    return facilities;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.findAllBssFacilitiesByDealId = findAllBssFacilitiesByDealId;

const findAllGefFacilitiesByDealId = async (dealId) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(facilitiesCollection);
    const facilities = await collection.find({ dealId: ObjectId(dealId) }).toArray();
    return facilities;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

exports.findAllGefFacilitiesByDealId = findAllGefFacilitiesByDealId;

exports.getAllGefFacilitiesByDealId = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const facilities = await findAllGefFacilitiesByDealId(req.params.id);
    return res.status(200).send(facilities);
  }
  return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
};

exports.findAllGefFacilities = async (req, res) => {
  const collection = await db.getCollection(facilitiesCollection);
  // GEF facilities only
  const facilities = await collection.find({ $or: [{ type: 'Cash' }, { type: 'Contingent' }] }).toArray();

  res.status(200).send(facilities);
};

exports.getAllPortalFacilities = async (req, res) => {
  const collection = await db.getCollection('facilities');
  const facilities = await collection.find({}).toArray();

  return res.status(200).send(facilities);
};
