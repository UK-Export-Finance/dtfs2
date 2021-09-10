const { ObjectID } = require('bson');
const db = require('../../../../drivers/db-client');

const findFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection('tfm-facilities');

  // NOTE: only GEF facilities have applicationId.
  // this could be adapted so that we get the deal, check dealType,
  // then search for either dealId or applicationId.
  const facilities = await collection.find({ 'facilitySnapshot.applicationId': { $eq: ObjectID(dealId) } }).toArray();

  return facilities;
};
exports.findFacilitiesByDealId = findFacilitiesByDealId;

exports.findFacilitiesGet = async (req, res) => {
  const facilities = await findFacilitiesByDealId(req.params.id);

  return res.status(200).send(facilities);
};
