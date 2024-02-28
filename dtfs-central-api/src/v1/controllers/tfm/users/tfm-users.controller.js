const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client').default;
const { DB_COLLECTIONS, PAYLOAD } = require('../../../../constants');
const { payloadVerification } = require('../../../../helpers');

const createUser = async (User) => {
  const collection = await db.getCollection(DB_COLLECTIONS.TFM_USERS);
  return collection.insertOne(User);
};
exports.createUser = createUser;

exports.createTfmUser = async (req, res) => {
  const payload = req?.body?.user;

  if (payloadVerification(payload, PAYLOAD.TFM.USER)) {
    const response = await createUser(payload);

    const { insertedId } = response;
    return res.status(200).json({ _id: insertedId });
  }

  return res.status(400).send({ status: 400, message: 'Invalid TFM user payload' });
};

const listUsers = async () => {
  const collection = await db.getCollection(DB_COLLECTIONS.TFM_USERS);
  return collection.find().toArray();
};
exports.listUsers = listUsers;

exports.listTfmUser = async (req, res) => {
  const users = await listUsers();
  return res.status(200).send({ users });
};

const findOneUser = async (username) => {
  if (typeof username !== 'string') {
    return { status: 400, message: 'Invalid Username' };
  }

  const collection = await db.getCollection(DB_COLLECTIONS.TFM_USERS);
  return collection.findOne({ username: { $eq: username } });
};
exports.findOneUser = findOneUser;

exports.findOneTfmUser = async (req, res) => {
  const user = await findOneUser(req.params.username);

  if (user) {
    return res.status(200).send(user);
  }

  return res.status(404).send();
};

const findOneUserById = async (userId) => {
  if (ObjectId.isValid(userId)) {
    const collection = await db.getCollection(DB_COLLECTIONS.TFM_USERS);
    const user = await collection.findOne({ _id: { $eq: new ObjectId(userId) } });
    return user;
  }
  return { status: 400, message: 'Invalid User Id' };
};
exports.findOneUserById = findOneUserById;

exports.findOneTfmUserById = async (req, res) => {
  if (ObjectId.isValid(req.params.userId)) {
    const user = await findOneUserById(req.params.userId);

    if (user) {
      return res.status(200).send(user);
    }

    return res.status(404).send({ status: 404, message: 'User not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid User Id' });
};

exports.findTfmTeamUser = async (req, res) => {
  const { teamId } = req.params;

  if (typeof teamId !== 'string') {
    return res.status(400).send('Invalid teamId');
  }
  const collection = await db.getCollection(DB_COLLECTIONS.TFM_USERS);

  const teamUsers = await collection.find({ teams: { $in: [teamId] } }).toArray();
  const reversedTeamUsers = teamUsers.reverse();

  return res.status(200).send(reversedTeamUsers);
};

const deleteUser = async (username) => {
  if (typeof username === 'string') {
    const collection = await db.getCollection(DB_COLLECTIONS.TFM_USERS);
    return collection.deleteOne({ username: { $eq: username } });
  }

  return false;
};
exports.deleteUser = deleteUser;

exports.deleteTfmUser = async (req, res) => {
  const deleted = await deleteUser(req.params.username);

  return deleted
    ? res.status(200).send(deleted)
    : res.status(400).send({ status: 400, message: 'Invalid username' });
};
