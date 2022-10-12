const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');

const usersCollection = 'tfm-users';

const createUser = async (User) => {
  const collection = await db.getCollection(usersCollection);
  return collection.insertOne(User);
};
exports.createUser = createUser;

exports.createUserPOST = async (req, res) => {
  const { user } = req.body;
  const response = await createUser(user);

  const { insertedId } = response;
  res.status(200).send({ _id: insertedId });
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
  const { username } = req.params;
  const user = await findOneUser(username);
  if (user) {
    return res.status(200).send(user);
  }
  return res.status(404).send();
};

const findOneUserById = async (userId) => {
  const collection = await db.getCollection(usersCollection);
  return collection.findOne({ _id: new ObjectId(userId) });
};
exports.findOneUserById = findOneUserById;

exports.getTfmUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await findOneUserById(userId);
  if (user) {
    return res.status(200).send(user);
  }
  return res.status(404).send({ status: 404, message: 'User not found' });
};

const findUsersByTeamId = async (teamId) => {
  const collection = await db.getCollection(usersCollection);
  const teamUsers = await collection.find({ teams: { $in: [teamId] }, }).toArray();
  return teamUsers.reverse();
};

exports.getUsersByTeamId = async (req, res) => {
  const { teamId } = req.params;
  const teamUsers = await findUsersByTeamId(teamId);
  return res.status(200).send(teamUsers);
};

const deleteUser = async (username) => {
  const collection = await db.getCollection(usersCollection);
  return collection.deleteOne({ username });
};
exports.deleteUser = deleteUser;

exports.deleteTfmUser = async (req, res) => {
  const { username } = req.params;
  const deleted = await deleteUser(username);
  return res.status(200).send(deleted);
};
