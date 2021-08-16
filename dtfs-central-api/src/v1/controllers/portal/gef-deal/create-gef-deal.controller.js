const db = require('../../../../drivers/db-client');

const createDeal = async (deal) => {
  const collection = await db.getCollection('gef-application');

  const response = await collection.insertOne(deal);

  const createdDeal = response.ops[0];

  return createdDeal;
};

exports.createDealPost = async (req, res) => {
  const createdDeal = await createDeal(req.body);

  return res.status(200).send(createdDeal);
};
