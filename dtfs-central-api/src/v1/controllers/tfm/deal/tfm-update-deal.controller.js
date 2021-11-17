const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./tfm-get-deal.controller');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const updateDeal = async (dealId, dealChanges, existingDeal) => {
  const collection = await db.getCollection('tfm-deals');

  // remove dealSnapshot to ensure its not updated
  const { dealSnapshot, ...tfmUpdate } = dealChanges;

  let dealUpdate = tfmUpdate;

  /**
   * Ensure tfm.history is not wiped and avoid recursive object creation
   * by checking .recipient property for the emails object and
   * by checking .taskId property for the tasks object.
   * */

  if (existingDeal.tfm && existingDeal.tfm.history) {
    dealUpdate = {
      tfm: {
        ...existingDeal.tfm,
        ...tfmUpdate.tfm,
        history: existingDeal.tfm.history,
      },
    };

    if (tfmUpdate.tfm.history) {
      if (tfmUpdate.tfm.history.tasks && tfmUpdate.tfm.history.tasks.taskId) {
        dealUpdate.tfm.history.tasks = [
          ...existingDeal.tfm.history.tasks,
          ...tfmUpdate.tfm.history.tasks,
        ];
      }

      if (
        tfmUpdate.tfm.history.emails
        && tfmUpdate.tfm.history.emails.recipient
      ) {
        dealUpdate.tfm.history.emails = [
          ...existingDeal.tfm.history.emails,
          ...tfmUpdate.tfm.history.emails,
        ];
      }
    }
  }

  /**
   * Ensure tfm.activities is not wiped and avoid recursive object creation
   * by checking .type property for the activities object
   * */

  if (
    existingDeal.tfm
    && existingDeal.tfm.activities
    && tfmUpdate.tfm.activities.type
  ) {
    dealUpdate = {
      tfm: {
        ...existingDeal.tfm,
        ...tfmUpdate.tfm,
        activities: existingDeal.tfm.activities,
      },
    };

    if (tfmUpdate.tfm.activities) {
      dealUpdate.tfm.activities = [
        ...existingDeal.tfm.activities,
        { ...tfmUpdate.tfm.activities },
      ];
    }
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
