const db = require('../../../drivers/db-client');

const createUser = async (user) => {
  const collection = await db.getCollection('users');

  const response = await collection.insertOne(user);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createUserPost = async (req, res) => {
  const user = await createUser(req.body);

  if (user) {
    return res.status(200).send(user);
  }

  return res.status(404).send();
};
