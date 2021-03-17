const $ = require('mongo-dot-notation');
const { ObjectID } = require('mongodb');

/* eslint-disable no-underscore-dangle */
const db = require('../../../../drivers/db-client');

const usersCollection = 'tfm-users';

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const createUser = async (User) => {
  const collection = await db.getCollection(usersCollection);
  return collection.insertOne(User);
};
exports.createUser = createUser;

exports.createUserPOST = async (req, res) => {
  const user = await createUser(req.body.user);
  res.status(200).json(user.ops[0]);
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

const findOneUser = async (username) => {
  const collection = await db.getCollection(usersCollection);
  return collection.findOne({ username });
};
exports.findOneUser = findOneUser;

exports.findOneUserGET = async (req, res) => {
  const user = await findOneUser(req.params.username);

  if (user) {
    return res.status(200).send({
      user,
    });
  }

  return res.status(404).send();
};

const findOneUserById = async (userId) => {
  const collection = await db.getCollection(usersCollection);
  const user = await collection.findOne({ _id: new ObjectID(userId) });
  return user;
};

const updateUser = async (userId, update) => {
  const collection = await db.getCollection(usersCollection);

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: userId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  return findAndUpdateResponse.value;
};

exports.updateUserTasksPUT = async (req, res) => {
  const { id } = req.params;

  const { updatedTasks } = req.body;

  const user = await findOneUserById(id);

  const userUpdate = {
    ...user,
    assignedTasks: updatedTasks,
  };

  if (user) {
    const updatedUser = await updateUser(
      user._id,
      userUpdate,
    );

    return res.status(200).json(updatedUser);
  }
  return res.status(404).send();
};

const deleteUser = async (username) => {
  const collection = await db.getCollection(usersCollection);

  const deleted = await collection.deleteOne({ username });
  return deleted;
};
exports.deleteUser = deleteUser;

exports.deleteUserDELETE = async (req, res) => {
  const deleted = await deleteUser(req.params.username);
  return res.status(200).send(deleted);
};
