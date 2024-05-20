const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client').default;

const findOneDeal = async (_id, callback) => {
  if (ObjectId.isValid(_id)) {
    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    const deal = await dealsCollection.findOne({ _id: { $eq: ObjectId(_id) } });

    if (callback) {
      callback(deal);
    }

    return deal;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.findOneDeal = findOneDeal;

exports.findOneDealGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const deal = await findOneDeal(req.params.id);

    if (deal) {
      return res.status(200).send(deal);
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
};
