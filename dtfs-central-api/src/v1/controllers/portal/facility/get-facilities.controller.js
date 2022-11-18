const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');
const { FACILITIES: { FACILITY_TYPE: { BOND, LOAN, CASH, CONTINGENT } } } = require('../../../../constants');

const facilitiesCollection = 'facilities';

const findAllBssFacilitiesByDealId = async (dealId) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(facilitiesCollection);
    return collection.find({ dealId: ObjectId(dealId), $or: [{ type: BOND }, { type: LOAN }] }).toArray();
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.findAllBssFacilitiesByDealId = findAllBssFacilitiesByDealId;

const findAllGefFacilitiesByDealId = async (dealId) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(facilitiesCollection);
    const facilities = await collection.find({ dealId: ObjectId(dealId), $or: [{ type: CASH }, { type: CONTINGENT }] }).toArray();
    return facilities;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

exports.findAllGefFacilitiesByDealId = findAllGefFacilitiesByDealId;

exports.getAllGefFacilitiesByDealId = async (req, res) => {
  const facilities = await findAllGefFacilitiesByDealId(req.params.id);
  return res.status(200).send(facilities);
};

exports.findAllGefFacilities = async (req, res) => {
  const collection = await db.getCollection(facilitiesCollection);
  const facilities = await collection.find({ $or: [{ type: CASH }, { type: CONTINGENT }] }).toArray();
  res.status(200).send(facilities);
};

exports.getAllPortalFacilities = async (req, res) => {
  const collection = await db.getCollection('facilities');
  const facilities = await collection.find({}).toArray();
  return res.status(200).send(facilities);
};
