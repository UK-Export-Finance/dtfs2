const { MONGO_DB_COLLECTIONS, PAYLOAD_VERIFICATION, AUDIT_USER_TYPES, DocumentNotDeletedError } = require('@ukef/dtfs2-common');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { isVerifiedPayload } = require('@ukef/dtfs2-common/payload-verification');
const {
  validateAuditDetails,
  generateAuditDatabaseRecordFromAuditDetails,
  deleteOne,
  validateAuditDetailsAndUserType,
} = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const TfmUsersRepo = require('../../../../repositories/tfm-users-repo');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const createUser = async (user, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  return collection.insertOne({ ...user, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) });
};
exports.createUser = createUser;

/**
 * @deprecated Do not use -- Favour TFM API (removal todo:DTFS2-7160)
 */
exports.createTfmUser = async (req, res) => {
  const { user: payload, auditDetails } = req.body;

  if (!isVerifiedPayload({ payload, template: PAYLOAD_VERIFICATION.TFM.USER })) {
    return res.status(400).send({ status: 400, message: 'Invalid TFM user payload' });
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

  const response = await createUser(payload, auditDetails);

  const { insertedId } = response;
  return res.status(200).json({ _id: insertedId });
};

const listUsers = async () => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  return collection.find().toArray();
};
exports.listUsers = listUsers;

exports.listTfmUser = async (req, res) => {
  const users = await listUsers();
  return res.status(200).send({ users });
};

const findOneUser = async (username) => {
  if (typeof username !== 'string') {
    return { status: 400, message: 'Invalid Username' };
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  return collection.findOne({ username: { $eq: username } });
};
exports.findOneUser = findOneUser;

exports.findOneTfmUser = async (req, res) => {
  const user = await findOneUser(req.params.username);

  if (user) {
    return res.status(200).send(user);
  }

  return res.status(404).send();
};

const findOneUserById = async (userId) => {
  if (ObjectId.isValid(userId)) {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
    const user = await collection.findOne({ _id: { $eq: new ObjectId(userId) } });
    return user;
  }
  return { status: 400, message: 'Invalid User Id' };
};
exports.findOneUserById = findOneUserById;

exports.findOneTfmUserById = async (req, res) => {
  if (ObjectId.isValid(req.params.userId)) {
    const user = await findOneUserById(req.params.userId);

    if (user) {
      return res.status(200).send(user);
    }

    return res.status(404).send({ status: 404, message: 'User not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid User Id' });
};

exports.findTfmTeamUser = async (req, res) => {
  const { teamId } = req.params;

  if (typeof teamId !== 'string') {
    return res.status(400).send('Invalid teamId');
  }
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);

  const teamUsers = await collection.find({ teams: { $in: [teamId] } }).toArray();
  const reversedTeamUsers = teamUsers.reverse();

  return res.status(200).send(reversedTeamUsers);
};

exports.deleteTfmUser = async (req, res) => {
  const { username } = req.params;
  const { auditDetails } = req.body;

  if (!(typeof username === 'string')) {
    return res.status(400).send({ status: 400, message: 'Invalid username' });
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

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  const user = await collection.findOne({ username: { $eq: username } });

  if (!user) {
    return res.status(404).send({ status: 404, message: 'User not found' });
  }

  try {
    const deleteResult = await deleteOne({
      documentId: new ObjectId(user._id),
      collectionName: MONGO_DB_COLLECTIONS.TFM_USERS,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResult);
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'User not found' });
    }
    return res.status(500).send({ status: 500, error });
  }
};

/**
 * @param {import('../../../routes/middleware/payload-validation').PutTfmUserPayload} param0
 * @returns {import('@ukef/dtfs2-common').TfmUser} a complete tfm user
 */
exports.upsertTfmUser = async ({ userUpdateFromEntraIdUser, auditDetails }) => {
  return await TfmUsersRepo.upsertUser({ userUpdate: userUpdateFromEntraIdUser, auditDetails });
};
