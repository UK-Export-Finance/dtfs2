const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');

const usersCollection = 'tfm-users';

const createUser = async (User) => {
  const collection = await db.getCollection(usersCollection);
  const user = User;

  if (user.email) {
    user.email = user.email.toLowerCase();
  }

  if (user.username) {
    user.username = user.username.toLowerCase();
  }

  return collection.insertOne(User);
};
exports.createUser = createUser;

exports.createUserPOST = async (req, res) => {
  const response = await createUser(req.body.user);

  const { insertedId } = response;
  res.status(200).json({ _id: insertedId });
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
    return res.status(200).send(user);
  }

  return res.status(404).send();
};

const findOneUserById = async (userId) => {
  if (ObjectId.isValid(userId)) {
    const collection = await db.getCollection(usersCollection);
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    return user;
  }
  return { status: 400, message: 'Invalid User Id' };
};
exports.findOneUserById = findOneUserById;

exports.findOneUserByIdGET = async (req, res) => {
  if (ObjectId.isValid(req.params.userId)) {
    const user = await findOneUserById(req.params.userId);

    if (user) {
      return res.status(200).send(user);
    }

    return res.status(404).send({ status: 404, message: 'User not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid User Id' });
};

const findTeamUsers = async (teamId) => {
  const collection = await db.getCollection(usersCollection);

  const teamUsers = await collection.find({
    teams: { $in: [teamId] },
  }).toArray();

  return teamUsers.reverse();
};

exports.findTeamUsersGET = async (req, res) => {
  const { teamId } = req.params;
  const teamUsers = await findTeamUsers(teamId);

  return res.status(200).send(teamUsers);
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
