const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./tfm-get-deal.controller');
const { findAllFacilitiesByDealId } = require('../../portal/facility/get-facilities.controller');
const CONSTANTS = require('../../../../constants');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const updateDeal = async (dealId, dealChanges, existingDeal) => {
  const collection = await db.getCollection('tfm-deals');

  /**
   * Only use the tfm object. Remove anything else.
   * Only the tfm object should be updated.
   * - e.g dealSnapshot or any other root level data should not be updated.
   * */
  const { tfm } = dealChanges;

  const dealUpdate = { tfm };
  const tfmUpdate = dealUpdate.tfm;

  /**
   * Ensure that if a tfmUpdate with activities is an empty object,
   * we do not make activities an empty object.
   * */
  if (tfmUpdate.activities && Object.keys(tfmUpdate.activities).length === 0) {
    dealUpdate.tfm.activities = [];
  }

  /**
   * History helper variables
   * */
  const existingDealHistory = (existingDeal.tfm && existingDeal.tfm.history);
  const tfmUpdateHasHistory = tfmUpdate.history;
  const tfmUpdateHasHistoryTasks = (tfmUpdateHasHistory
                                    && tfmUpdate.history.tasks
                                    && Object.keys(tfmUpdate.history.tasks).length > 0);
  const tfmUpdateHasHistoryEmails = (tfmUpdateHasHistory
                                     && tfmUpdate.history.emails
                                     && Object.keys(tfmUpdate.history.emails).length > 0);

  /**
   * Ensure tfm.history is not wiped and avoid recursive object creation
   * by checking that history.tasks and history.emails is not empty
   * */
  if (existingDealHistory) {
    if (tfmUpdateHasHistoryTasks) {
      dealUpdate.tfm.history.tasks = [
        ...existingDeal.tfm.history.tasks,
        ...tfmUpdate.history.tasks,
      ];
    }

    if (tfmUpdateHasHistoryEmails) {
      dealUpdate.tfm.history.emails = [
        ...existingDeal.tfm.history.emails,
        ...tfmUpdate.history.emails,
      ];
    }
  }

  /**
   * Activities helper variables
   * */
  const existingDealActivities = (existingDeal.tfm && existingDeal.tfm.activities);
  const tfmUpdateHasActivities = (tfmUpdate.activities
                                  && Object.keys(tfmUpdate.activities).length > 0);
  /**
   * ACBS activities update is an array whereas TFM activity update is an object
   * Checks if array, then uses spread operator
   * else if not array, adds the object
   */
  if (tfmUpdateHasActivities) {
    if (Array.isArray(tfmUpdate.activities)) {
      const updatedActivities = [
        ...tfmUpdate.activities,
        ...existingDealActivities,
      ];
      // ensures that duplicate entries are not added to activities by comparing timestamp and label
      dealUpdate.tfm.activities = updatedActivities.filter((value, index, arr) =>
        arr.findIndex((item) => ['timestamp', 'label'].every((key) => item[key] === value[key])) === index);
    } else {
      const updatedActivities = [
        tfmUpdate.activities,
        ...existingDealActivities,
      ];
      // ensures that duplicate entries are not added to activities by comparing timestamp and label
      dealUpdate.tfm.activities = updatedActivities.filter((value, index, arr) =>
        arr.findIndex((item) => ['timestamp', 'label'].every((key) => item[key] === value[key])) === index);
    }
  }

  dealUpdate.tfm.lastUpdated = new Date().valueOf();

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(dealId) } },
    $.flatten(withoutId(dealUpdate)),
    { returnOriginal: false },
  );

  return findAndUpdateResponse.value;
};

exports.updateDealPut = async (req, res) => {
  const dealId = req.params.id;

  const { dealUpdate } = req.body;

  const deal = await findOneDeal(dealId, false, 'tfm');

  if (deal) {
    const updatedDeal = await updateDeal(
      dealId,
      dealUpdate,
      deal,
    );

    return res.status(200).json(updatedDeal);
  }
  return res.status(404).send();
};

const updateDealSnapshot = async (deal, snapshotChanges) => {
  try {
    const collection = await db.getCollection('tfm-deals');

    const update = {
      ...deal,
      dealSnapshot: {
        ...deal.dealSnapshot,
        ...snapshotChanges,
      },
    };

    const dealId = deal._id;

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(dealId)) } },
      $.flatten(withoutId(update)),
      { returnOriginal: false, upsert: true },
    );

    return findAndUpdateResponse.value;
  } catch (err) {
    console.error('Error updating TFM dealSnapshot', { err });
    return err;
  }
};

exports.updateDealSnapshotPut = async (req, res) => {
  const dealId = req.params.id;

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
  return res.status(404).send();
};
