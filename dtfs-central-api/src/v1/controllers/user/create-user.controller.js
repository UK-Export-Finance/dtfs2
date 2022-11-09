const { getCollection } = require('../../../database/mongo-client');

exports.postPortalUser = async (req, res) => {
  let response = {};
  let status = 200;
  try {
    const collection = await getCollection('users');
    response = await collection.insertOne(req.body);
  } catch (error) {
    status = 500;
  }

  return res.status(status).send({ _id: response?.insertedId });
};
