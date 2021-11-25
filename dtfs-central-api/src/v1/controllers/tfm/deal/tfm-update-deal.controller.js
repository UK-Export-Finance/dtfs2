const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./tfm-get-deal.controller');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const updateDeal = async (dealId, dealChanges, existingDeal) => {
  const collection = await db.getCollection('tfm-deals');

  /**
   * Only use the tfm object. Remove anything else.
   * Only the tfm object should be updated.
   * - e.g dealSnapshot or any other root level data should not be updatedd.
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
   * Ensure tfm.activities is not wiped and avoid recursive object creation
   * by checking .type property for the activities object.
   * tfm.activities to be checked for submitting tfm.tasks
   * */
  if (tfmUpdateHasActivities) {
    dealUpdate.tfm.activities = [
      tfmUpdate.activities,
      ...existingDealActivities,
    ];
  }

  dealUpdate.tfm.lastUpdated = new Date().valueOf();

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
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
  const collection = await db.getCollection('tfm-deals');

  const update = {
    ...deal,
    dealSnapshot: {
      ...deal.dealSnapshot,
      ...snapshotChanges,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const dealId = deal._id;

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(update)),
    { returnOriginal: false, upsert: true },
  );

  return findAndUpdateResponse.value;
};

exports.updateDealSnapshotPut = async (req, res) => {
  const dealId = req.params.id;

  const deal = await findOneDeal(dealId, false, 'tfm');

  const snapshotUpdate = req.body;

  if (deal) {
    const updatedDeal = await updateDealSnapshot(
      deal,
      snapshotUpdate,
    );
    return res.status(200).json(updatedDeal);
  }
  return res.status(404).send();
};
