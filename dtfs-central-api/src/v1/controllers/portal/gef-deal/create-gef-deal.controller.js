const db = require('../../../../drivers/db-client');

const createDeal = async (deal) => {
  const collection = await db.getCollection('deals');

  const response = await collection.insertOne(deal);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createDealPost = async (req, res) => {
  if (typeof req?.body?.deal?.dealType !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid deal payload' });
  }

  const createdDeal = await createDeal(req.body);

  return res.status(200).send(createdDeal);
};
