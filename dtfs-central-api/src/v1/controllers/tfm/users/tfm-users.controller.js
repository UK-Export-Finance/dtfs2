/* eslint-disable no-underscore-dangle */
const { ObjectID } = require('mongodb');
const db = require('../../../../drivers/db-client');

const usersCollection = 'tfm-users';

const createUser = async (User) => {
  const collection = await db.getCollection(usersCollection);
  return collection.insertOne(User);
};
exports.createUser = createUser;

exports.createUserPOST = async (req, res) => {
  const user = await createUser(req.body);
  res.status(200).json(user);
};

const listUsers = async () => {
  const collection = await db.getCollection(usersCollection);
  return collection.find({}).toArray();
};
exports.listUsers = listUsers;

exports.listUsersGET = async (req, res) => {
  const users = await listUsers();
  return res.status(200).send({ users });
};

const findOneUser = async (username, callback) => {
  const collection = await db.getCollection(usersCollection);

  collection.findOne({ username }, callback);
};
exports.findOneUser = findOneUser;

exports.findOneUserGET = async (req, res) => {
  const user = await findOneUser(req.params._id);
  if (user) {
    return res.status(200).send({
      user,
    });
  }

  return res.status(404).send();
};

const deleteUser = async (_id) => {
  const collection = await db.getCollection(usersCollection);
  console.log({ deleteUser: _id });
  const deleted = await collection.deleteOne({ _id: new ObjectID(_id) });
  return deleted;
};
exports.deleteUser = deleteUser;

exports.deleteUserDELETE = async (req, res) => {
  const deleted = await deleteUser(req.params._id);
  return res.status(200).send(deleted);
};
