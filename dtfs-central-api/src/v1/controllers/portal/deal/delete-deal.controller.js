const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');

exports.deleteDeal = async (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      const collection = await db.getCollection('deals');
      const status = await collection.deleteOne({ _id: ObjectId(req.params.id) });
      return res.status(200).send(status);
    }

    return res.status(404).send();
  });
};
