const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } = require('@ukef/dtfs2-common/change-stream');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common/errors');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const db = require('../../../../drivers/db-client').default;
const DEFAULTS = require('../../../defaults');
const getDealErrors = require('../../../validation/create-deal');

const createDeal = async (deal, maker, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const { details } = deal;

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const newDeal = {
    ...DEFAULTS.DEAL,
    ...deal,
    updatedAt: Date.now(),
    maker,
    bank: maker && maker.bank,
    details: {
      ...DEFAULTS.DEAL.details,
      ...details,
      created: Date.now(),
    },
    facilities: DEFAULTS.DEAL.facilities,
    auditRecord,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return {
      deal: newDeal,
      validationErrors,
    };
  }

  const response = await collection.insertOne(newDeal);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createDealPost = async (req, res) => {
  try {
    const { user, deal, auditDetails } = req.body;

    if (!user) {
      return res.status(400).send({ status: 400, message: 'Invalid user' });
    }

    if (typeof deal?.dealType !== 'string') {
      return res.status(400).send({ status: 400, message: 'Invalid deal type' });
    }

    validateAuditDetailsAndUserType(auditDetails, 'portal');

    const { validationErrors, _id } = await createDeal(deal, user, auditDetails);

    if (validationErrors) {
      return res.status(400).send({
        _id,
        validationErrors,
      });
    }

    return res.status(200).send({ _id });
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    throw error;
  }
};
