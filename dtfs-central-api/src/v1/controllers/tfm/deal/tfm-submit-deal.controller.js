const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client').default;
const { findOneDeal, findOneGefDeal } = require('../../portal/deal/get-deal.controller');
const tfmController = require('./tfm-get-deal.controller');

const { findAllFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');
const { findAllGefFacilitiesByDealId } = require('../../portal/gef-facility/get-facilities.controller');

const DEFAULTS = require('../../../defaults');
const CONSTANTS = require('../../../../constants');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const getSubmissionCount = (deal) => {
  const { dealType } = deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return deal.submissionCount;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    return deal.details.submissionCount;
  }

  return null;
};

const createDealSnapshot = async (deal, auditDetails) => {
  if (ObjectId.isValid(deal._id)) {
    const { dealType, _id: dealId } = deal;
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_DEALS);

    const submissionCount = getSubmissionCount(deal);
    const tfmInit = submissionCount === 1 ? { tfm: DEFAULTS.DEAL_TFM } : null;

    const dealObj = {
      dealSnapshot: deal,
      ...tfmInit,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      const dealFacilities = await findAllFacilitiesByDealId(dealId);
      dealObj.dealSnapshot.facilities = dealFacilities;
    }

    const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(deal._id) } }, $.flatten(withoutId(dealObj)), {
      returnNewDocument: true,
      returnDocument: 'after',
      upsert: true,
    });

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

const createFacilitiesSnapshot = async (deal, auditDetails) => {
  if (ObjectId.isValid(deal._id)) {
    const { dealType, _id: dealId } = deal;

    let dealFacilities = [];
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      dealFacilities = await findAllFacilitiesByDealId(dealId);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      dealFacilities = await findAllGefFacilitiesByDealId(dealId);
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);

    const submissionCount = getSubmissionCount(deal);

    const tfmInit = submissionCount === 1 ? { tfm: DEFAULTS.FACILITY_TFM } : null;

    if (dealFacilities) {
      const updatedFacilities = Promise.all(
        dealFacilities.map(async (facility) =>
          collection.findOneAndUpdate(
            {
              _id: { $eq: ObjectId(facility._id) },
            },
            $.flatten({
              facilitySnapshot: facility,
              ...tfmInit,
              auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
            }),
            {
              returnNewDocument: true,
              returnDocument: 'after',
              upsert: true,
            },
          ),
        ),
      );

      return updatedFacilities;
    }

    return null;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

const submitDeal = async (deal, auditDetails) => {
  await createDealSnapshot(deal, auditDetails);

  await createFacilitiesSnapshot(deal, auditDetails);

  const updatedDeal = await tfmController.findOneDeal(String(deal._id));

  return updatedDeal;
};

exports.submitDealPut = async (req, res) => {
  const { dealId, dealType, auditDetails } = req.body;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: `Invalid dealId, ${dealId}` });
  }

  try {
    validateAuditDetailsAndUserType(auditDetails, 'portal');
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(400).send({
        status: 400,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  if (dealType !== CONSTANTS.DEALS.DEAL_TYPE.GEF && dealType !== CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    return res.status(400).send({ status: 400, message: 'Invalid deal type' });
  }

  let deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    deal = await findOneGefDeal(dealId);
  }
  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    deal = await findOneDeal(dealId);
  }

  if (!deal) {
    return res.status(404).send();
  }

  const updatedDeal = await submitDeal(deal, auditDetails);
  return res.status(200).json(updatedDeal);
};
