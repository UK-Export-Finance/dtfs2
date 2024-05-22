const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client').default;

const findOneUser = async (_id) => {
  if (ObjectId.isValid(_id)) {
    const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

    const user = await usersCollection.findOne({ _id: { $eq: ObjectId(_id) } });

    return user;
  }
  return { status: 400, message: 'Invalid User Id' };
};
exports.findOneUser = findOneUser;

exports.findOneUserGet = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const user = await findOneUser(req.params.id);

    if (user) {
      return res.status(200).send(user);
    }

    return res.status(404).send({ status: 404, message: 'User not found' });
  }

  return res.status(400).send({ status: 400, message: 'Invalid User Id' });
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

const sanitizeUsers = (users) => users.map(sanitizeUser);

const list = async (callback) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);

  collection.find().toArray(callback);
};

exports.list = (req, res, next) => {
  list((error, users) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        success: true,
        count: users.length,
        users: sanitizeUsers(users),
      });
    }
  });
};
