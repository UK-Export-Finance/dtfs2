const { findOneDeal } = require('./deal.controller');
const db = require('../../drivers/db-client');
const { isSuperUser, userHasAccessTo } = require('../users/checks');

exports.deleteDeal = async (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      } else {
        const collection = await db.getCollection('deals');
        const status = await collection.deleteOne({ _id: req.params.id });
        res.status(200).send(status);
      }
    }
  });
};
