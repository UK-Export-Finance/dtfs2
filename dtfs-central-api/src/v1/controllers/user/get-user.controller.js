const { ObjectId } = require('mongodb');
const { getCollection } = require('../../../database/mongo-client');

exports.getPortalUserById = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection('users');
    response = await collection.findOne({ _id: ObjectId(req.params.userId) });
    status = response ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send(response);
};

const findPortalUsers = async () => {
  const collection = await getCollection('users');

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

exports.getPortalUsers = async (req, res) => {
  let response = [];
  let status;
  try {
    response = await findPortalUsers();
    status = response.length ? 200 : 404;
  } catch (error) {
    status = 500;
  }
  const success = status === 200;

  return res.status(status).send({ success, users: response, count: response.length });
};
