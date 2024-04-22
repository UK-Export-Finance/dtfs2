const { validateAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/validate-audit-details');
const { generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-database-record');
const db = require('../../../../drivers/db-client');
const { DB_COLLECTIONS, PAYLOAD } = require('../../../../constants');
const { payloadVerification } = require('../../../../helpers');

const createTeam = async (team, auditDetails) => {
  const collection = await db.getCollection(DB_COLLECTIONS.TFM_TEAMS);
  return collection.insertOne({ ...team, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) });
};
exports.createTeam = createTeam;

exports.createTfmTeam = async (req, res) => {
  const { team: teamToCreate, auditDetails } = req.body;

  if (!payloadVerification(teamToCreate, PAYLOAD.TFM.TEAM)) {
    return res.status(400).send({ status: 400, message: 'Invalid TFM team payload' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch ({ message }) {
    return res.status(400).send({ status: 400, message: `Invalid auditDetails, ${message}` });
  }

  if (auditDetails.userType !== 'tfm') {
    return res.status(400).send({ status: 400, message: `Invalid auditDetails, userType must be 'tfm'` });
  }

  const { insertedId } = await createTeam(teamToCreate, auditDetails);

  return res.status(200).json({
    _id: insertedId,
  });
};

const listTeams = async () => {
  const collection = await db.getCollection(DB_COLLECTIONS.TFM_TEAMS);
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

  const collection = await db.getCollection(DB_COLLECTIONS.TFM_TEAMS);
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

const deleteTeam = async (id) => {
  if (typeof id === 'string') {
    const collection = await db.getCollection(DB_COLLECTIONS.TFM_TEAMS);
    return collection.deleteOne({ id: { $eq: id } });
  }

  return false;
};
exports.deleteTeam = deleteTeam;

exports.deleteTfmTeam = async (req, res) => {
  const deleted = await deleteTeam(req.params.id);

  return deleted ? res.status(200).send(deleted) : res.status(400).send({ status: 400, message: 'Invalid team Id' });
};
