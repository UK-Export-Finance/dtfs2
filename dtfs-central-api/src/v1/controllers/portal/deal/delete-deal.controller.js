const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');

exports.deleteDeal = (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (ObjectId.isValid(req.params.id)) {
      if (deal) {
        const collection = await db.getCollection('deals');
        const status = await collection.deleteOne({ _id: ObjectId(req.params.id) });
        return res.status(200).send(status);
      }

      return res.status(404).send({ status: 404, message: 'Deal not found' });
    }
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  });
};
