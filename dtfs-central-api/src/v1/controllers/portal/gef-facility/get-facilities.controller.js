const db = require('../../../../drivers/db-client');

const findAllGefFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection('gef-facilities');
  const facilities = collection.find({ applicationId: dealId });
  return facilities.toArray();
};
exports.findAllGefFacilitiesByDealId = findAllGefFacilitiesByDealId;

exports.findAllGet = async (req, res) => {
  const facilities = await findAllGefFacilitiesByDealId(req.params.id);

  return res.status(200).send(facilities);
};
