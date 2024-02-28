const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client').default;
const { DB_COLLECTIONS } = require('../../../../constants');

exports.deleteDeal = async (req, res) => {
  const { id } = req.params;

  findOneDeal(id, async (deal) => {
    if (ObjectId.isValid(id)) {
      if (deal) {
        const collection = await db.getCollection(DB_COLLECTIONS.DEALS);
        const status = await collection.deleteOne({ _id: { $eq: ObjectId(id) } });
        return res.status(200).send(status);
      }

      return res.status(404).send({ status: 404, message: 'Deal not found' });
    }
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  });
};
