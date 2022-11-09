const { getCollection } = require('../../../../database/mongo-client');

const teamsCollection = 'tfm-teams';

exports.postTeam = async (req, res) => {
  let response = {};
  let status = 200;
  try {
    const collection = await getCollection(teamsCollection);
    response = await collection.insertOne(req.body.team);
    status = response ? 200 : 400;
  } catch (error) {
    status = 500;
  }

  return res.status(status).send({ _id: response?.insertedId });
};

exports.getTeams = async (req, res) => {
  let response = {};
  let status = 200;
  try {
    const collection = await getCollection(teamsCollection);
    response = await collection.find({}).toArray();
    status = response.length ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send({ teams: response });
};

exports.getTeamById = async (req, res) => {
  let response = {};
  let status;
  try {
    const collection = await getCollection(teamsCollection);
    response = await collection.findOne({ id: { $eq: req.params.id } });
    status = response ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send({ team: response });
};

exports.deleteTeamById = async (req, res) => {
  let status;
  let response = {};
  try {
    const collection = await getCollection(teamsCollection);
    response = await collection.deleteOne({ id: { $eq: req.params.id } });
    status = response ? 200 : 404;
  } catch (error) {
    status = 404;
  }

  return res.status(status).send(response);
};
