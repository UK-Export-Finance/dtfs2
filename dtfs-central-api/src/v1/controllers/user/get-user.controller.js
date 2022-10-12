const { ObjectId } = require('mongodb');
const db = require('../../../database/mongo-client');

const findOnePortalUser = async (_id) => {
  const usersCollection = await db.getCollection('users');
  return usersCollection.findOne({ _id: ObjectId(_id) });
};
exports.findOnePortalUser = findOnePortalUser;

exports.findOnePortalUserGet = async (req, res) => {
  const { userId } = req.params;
  const user = await findOnePortalUser(userId);

  if (user) {
    return res.status(200).send(user);
  }

  return res.status(404).send({ status: 404, message: 'User not found' });
};

const sanitizeUser = (user) => ({
  username: user.username,
  firstname: user.firstname,
  surname: user.surname,
  email: user.email,
  roles: user.roles,
  bank: user.bank,
  timezone: user.timezone,
  lastLogin: user.lastLogin,
  'user-status': user['user-status'],
  disabled: user.disabled,
  _id: user._id,
});

const listPortalUsers = async () => {
  const collection = await db.getCollection('users');

  return collection.find({}).toArray();
};

exports.listAllPortalUsers = async (req, res) => {
  const users = await listPortalUsers();
  if (users) {
    return res.status(200).send({
      success: true,
      count: users.length,
      users: users.map(sanitizeUser),
    });
  }
  return res.status(500).send({ success: false });
};
