const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

const findOneDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id: ObjectId(_id) });

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneDeal = findOneDeal;

exports.findOneDealGet = async (req, res) => {
  const deal = await findOneDeal(req.params.id);

  if (deal) {
    return res.status(200).send(deal);
  }

  return res.status(404).send();
};
