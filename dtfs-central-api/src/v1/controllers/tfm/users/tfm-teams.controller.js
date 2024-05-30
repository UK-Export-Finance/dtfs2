const { MONGO_DB_COLLECTIONS, PAYLOAD_VERIFICATION } = require('@ukef/dtfs2-common');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common/errors');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const db = require('../../../../drivers/db-client').default;

const createTeam = async (team, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_TEAMS);
  return collection.insertOne({ ...team, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) });
};
exports.createTeam = createTeam;

exports.createTfmTeam = async (req, res) => {
  const { team: teamToCreate, auditDetails } = req.body;

  if (!isVerifiedPayload({ payload: teamToCreate, template: PAYLOAD_VERIFICATION.TFM.TEAM })) {
    return res.status(400).send({ status: 400, message: 'Invalid TFM team payload' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
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

const deleteTeam = async (id) => {
  if (typeof id === 'string') {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_TEAMS);
    return collection.deleteOne({ id: { $eq: id } });
  }

  return false;
};
exports.deleteTeam = deleteTeam;

exports.deleteTfmTeam = async (req, res) => {
  const deleted = await deleteTeam(req.params.id);

  return deleted ? res.status(200).send(deleted) : res.status(400).send({ status: 400, message: 'Invalid team Id' });
};
