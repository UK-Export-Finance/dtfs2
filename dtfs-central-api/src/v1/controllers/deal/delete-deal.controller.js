const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../drivers/db-client');

exports.deleteDeal = async (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      const collection = await db.getCollection('deals');
      const tfmCollection = await db.getCollection('tfm-deals');
      console.log('delete tfm', req.params.id);
      const status = await collection.deleteOne({ _id: req.params.id });
      await tfmCollection.deleteOne({ _id: req.params.id });

      return res.status(200).send(status);
    }

    return res.status(404).send();
  });
};
