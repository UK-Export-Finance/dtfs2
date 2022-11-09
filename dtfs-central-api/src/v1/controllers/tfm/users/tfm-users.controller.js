const { ObjectId } = require('mongodb');
const { getCollection } = require('../../../../database/mongo-client');

const usersCollection = 'tfm-users';

exports.postTfmUser = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection(usersCollection);
    response = await collection.insertOne(req.body.user);
    status = response ? 200 : 400;
  } catch (error) {
    status = 500;
  }

  return res.status(status).send({ _id: response?.insertedId });
};

exports.getTfmUsers = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection(usersCollection);
    response = await collection.find({}).toArray();
    status = response.length ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send({ users: response });
};

exports.getTfmUserByUsername = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection(usersCollection);
    response = await collection.findOne({ username: { $eq: req.params.username } });
    status = response ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send(response);
};

exports.getTfmUserById = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection(usersCollection);
    response = await collection.findOne({ _id: ObjectId(req.params.userId) });
    status = response ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send(response);
};

exports.getUsersByTeamId = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection(usersCollection);
    response = await collection.find({ teams: { $in: [req.params.teamId] }, }).toArray();
    status = response.length ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send(response);
};

exports.deleteTfmUser = async (req, res) => {
  let status;
  let response = {};
  try {
    const collection = await getCollection(usersCollection);
    response = await collection.deleteOne({ username: { $eq: req.params.username } });
    status = response ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send(response);
};
