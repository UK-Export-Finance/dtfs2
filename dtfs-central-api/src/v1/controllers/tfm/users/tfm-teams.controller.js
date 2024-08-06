const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, PAYLOAD_VERIFICATION, AUDIT_USER_TYPES, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const {
  validateAuditDetails,
  generateAuditDatabaseRecordFromAuditDetails,
  deleteOne,
  validateAuditDetailsAndUserType,
} = require('@ukef/dtfs2-common/change-stream');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

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
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
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

exports.deleteTfmTeam = async (req, res) => {
  const { id } = req.params;
  const { auditDetails } = req.body;

  if (!(typeof id === 'string')) {
    return res.status(400).send({ status: 400, message: 'Invalid team Id' });
  }

  // Teams have both id and _id. The delete team request specifies the id of the team to delete, however deleteOne requires _id to operate
  const teamsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_TEAMS);
  const team = await teamsCollection.findOne({ id: { $eq: id } });

  if (!team) {
    return res.status(404).send({ status: 404, message: 'Team not found' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  try {
    const deleteResult = await deleteOne({
      documentId: new ObjectId(team._id),
      collectionName: MONGO_DB_COLLECTIONS.TFM_TEAMS,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'Team not found' });
    }
    console.error('Error deleting TFM team %o', error);
    return res.status(500).send({ status: 500, error });
  }
};
