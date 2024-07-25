const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const listTeams = async () => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_TEAMS);
  return collection.find().toArray();
};
exports.listTeams = listTeams;

exports.listTfmTeam = async (req, res) => {
  const teams = await listTeams();
  return res.status(200).send({ teams });
};

const findOneTeam = async (id) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid Team Id');
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_TEAMS);
  return collection.findOne({ id: { $eq: id } });
};
exports.findOneTeam = findOneTeam;

exports.findOneTfmTeam = async (req, res) => {
  const team = await findOneTeam(req.params.id);
  if (team) {
    return res.status(200).send({
      team,
    });
  }

  return res.status(404).send();
};
