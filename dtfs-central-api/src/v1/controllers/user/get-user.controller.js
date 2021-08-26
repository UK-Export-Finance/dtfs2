const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');

const findOneUser = async (_id) => {
  const usersCollection = await db.getCollection('users');

  const user = await usersCollection.findOne({ _id: ObjectId(_id) });

  return user;
};
exports.findOneUser = findOneUser;

exports.findOneUserGet = async (req, res) => {
  const user = await findOneUser(req.params.id);

  if (user) {
    return res.status(200).send(user);
  }

  return res.status(404).send();
};
