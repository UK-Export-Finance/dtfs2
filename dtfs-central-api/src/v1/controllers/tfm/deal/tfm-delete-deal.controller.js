const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./tfm-get-deal.controller');
const db = require('../../../../drivers/db-client');

// eslint-disable-next-line consistent-return
exports.deleteDeal = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
  findOneDeal(id, async (deal) => {
    if (!deal) {
      return res.status(404).send({ status: 404, message: 'Deal not found' });
    }
    if (!ObjectId.isValid(deal._id)) {
      return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }

    const collection = await db.getCollection('tfm-deals');
    const facilitiesCollection = await db.getCollection('tfm-facilities');
    const status = await collection.deleteOne({ _id: { $eq: ObjectId(id) } });

    await facilitiesCollection.deleteMany({ 'facilitySnapshot.dealId': { $eq: deal._id } });
    return res.status(200).send(status);
  });
};
