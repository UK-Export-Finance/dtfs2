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

const listPortalUsers = async () => {
  const collection = await db.getCollection('users');

  return collection.aggregate([
    {
      $project: {
        username: 1,
        firstname: 1,
        surname: 1,
        email: 1,
        roles: 1,
        bank: 1,
        timezone: 1,
        lastLogin: 1,
        'user-status': 1,
        disabled: 1
      }
    }
  ]).toArray();
};

exports.listAllPortalUsers = async (req, res) => {
  const users = await listPortalUsers();
  if (users) {
    return res.status(200).send({
      success: true,
      count: users.length,
      users,
    });
  }
  return res.status(500).send({ success: false });
};
