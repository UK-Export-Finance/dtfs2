const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { generateTfmUserAuditDetails, generateSystemAuditDetails } = require('@ukef/dtfs2-common/src/helpers/changeStream/generateAuditDetails');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./tfm-get-deal.controller');
const { findAllFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');
const CONSTANTS = require('../../../../constants');
const { isNumber } = require('../../../../helpers');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

/**
 * @param {string} dealId - deal to be updated
 * @param {object} dealChanges - updates to make
 * @param {object} existingDeal
 * @param {object} sessionUser - user making the update
 * @param {object} options - defaults to empty object
 * @returns {Promise<object>} updated deal or error object
 */
const updateDeal = async (dealId, dealChanges, existingDeal, sessionUser, options = {}) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(CONSTANTS.DB_COLLECTIONS.TFM_DEALS);

    /**
     * Only the tfm object should be updated.
     * - e.g dealSnapshot or any other root level data should not be updated.
     * */
    const dealUpdate = { tfm: dealChanges.tfm };

    if (dealUpdate.tfm) {
      /**
       * Ensure that if a tfmUpdate with activities is an empty object,
       * we do not make activities an empty object.
       */
      if (dealUpdate.tfm.activities && Object.keys(dealUpdate.tfm.activities).length === 0) {
        dealUpdate.tfm.activities = [];
      }

      const existingDealActivities = (existingDeal?.tfm?.activities);
      const tfmUpdateHasActivities = (dealUpdate.tfm.activities
                                  && Object.keys(dealUpdate.tfm.activities).length > 0);
      /**
       * ACBS activities update is an array whereas TFM activity update is an object
       * Checks if array, then uses spread operator
       * else if not array, adds the object
       */
      if (tfmUpdateHasActivities) {
        if (Array.isArray(dealUpdate.tfm.activities)) {
          const updatedActivities = [
            ...dealUpdate.tfm.activities,
            ...existingDealActivities,
          ];
          // ensures that duplicate entries are not added to activities by comparing timestamp and label
          dealUpdate.tfm.activities = updatedActivities.filter((value, index, arr) =>
            arr.findIndex((item) => ['timestamp', 'label'].every((key) => item[key] === value[key])) === index);
        } else {
          const updatedActivities = [
            dealUpdate.tfm.activities,
            ...existingDealActivities,
          ];
          // ensures that duplicate entries are not added to activities by comparing timestamp and label
          dealUpdate.tfm.activities = updatedActivities.filter((value, index, arr) =>
            arr.findIndex((item) => ['timestamp', 'label'].every((key) => item[key] === value[key])) === index);
        }
      }

      dealUpdate.tfm.lastUpdated = new Date().valueOf();
    }
    dealUpdate.auditDetails = options.isSystemUpdate ? generateSystemAuditDetails() : generateTfmUserAuditDetails(sessionUser._id);

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(dealId) } },
      $.flatten(withoutId(dealUpdate)),
      { returnNewDocument: true, returnDocument: 'after' }
    );

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

exports.updateDealPut = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  if (!ObjectId.isValid(req.body.user?._id) && !req.body.options?.isSystemUpdate) {
    return res.status(400).send({ status: 400, message: 'Invalid user' });
  }

  const dealId = req.params.id;

  const { dealUpdate, user, options } = req.body;

  const deal = await findOneDeal(dealId, false, 'tfm');

  if (!deal) {
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  const response = await updateDeal(
    dealId,
    dealUpdate,
    deal,
    user,
    options
  );

  const status = isNumber(response?.status, 3);
  const code = status ? response.status : 200;
  return res.status(code).json(response);
};

const updateDealSnapshot = async (deal, snapshotChanges) => {
  const dealId = deal._id;
  if (ObjectId.isValid(dealId)) {
    try {
      const collection = await db.getCollection(CONSTANTS.DB_COLLECTIONS.TFM_DEALS);
      const update = {
        dealSnapshot: {
          ...snapshotChanges,
        },
      };

      const findAndUpdateResponse = await collection.findOneAndUpdate(
        { _id: { $eq: ObjectId(String(dealId)) } },
        $.flatten(withoutId(update)),
        { returnNewDocument: true, returnDocument: 'after', upsert: true },
      );

      return findAndUpdateResponse.value;
    } catch (error) {
      console.error('Error updating TFM dealSnapshot %o', error);
      return { status: error?.response?.status || 500, data: 'Failed to update deal snapshot' };
    }
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

exports.updateDealSnapshotPut = async (req, res) => {
  const dealId = req.params.id;
  if (ObjectId.isValid(dealId)) {
    const deal = await findOneDeal(dealId, false, 'tfm');

    const snapshotUpdate = req.body;

    if (snapshotUpdate.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      const dealFacilities = await findAllFacilitiesByDealId(dealId);
      snapshotUpdate.facilities = dealFacilities;
    }

    if (deal) {
      const updatedDeal = await updateDealSnapshot(
        deal,
        snapshotUpdate,
      );
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
};
