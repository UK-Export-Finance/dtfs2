const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../drivers/db-client');
const now = require('../../../now');
const { PORTAL_ROUTE } = require('../../../constants/routes');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const handleEditedByPortal = async (dealId, dealUpdate, user) => {
  let editedBy = [];

  // sometimes we don't have a user making changes. When:
  // - we can get new data from type-b XML/workflow.
  // - some deal updates do not want to be marked as "edited by X user"
  // for example when a Checker submits a deal, they have not 'edited' the deal, only submitted it.

  if (user) {
    const {
      username,
      roles,
      bank,
      _id,
    } = user;

    const newEditedBy = {
      date: now(),
      username,
      roles,
      bank,
      userId: _id,
    };

    // if partial update
    // need to make sure that we have all existing entries in `editedBy`.
    // ideally we could refactor, perhaps, so that no partial updates are allowed.
    // but for now...
    if (!dealUpdate.editedBy) {
      const deal = await findOneDeal(dealId);
      editedBy = [
        ...deal.editedBy,
        newEditedBy,
      ];
    } else {
      editedBy = [
        ...dealUpdate.editedBy,
        newEditedBy,
      ];
    }
  }

  return {
    editedBy,
  };
};

const handleEditedByTfm = async (dealId, dealUpdate, user) => {
  let editedBy = [];

  // sometimes we don't have a user making changes. When:
  // - we can get new data from type-b XML/workflow.
  // - some deal updates do not want to be marked as "edited by X user"
  // for example when a Checker submits a deal, they have not 'edited' the deal, only submitted it.

  if (user) {
    const {
      username,
      _id,
    } = user;

    const newEditedBy = {
      date: now(),
      username,
      userId: _id,
    };

    // if partial update
    // need to make sure that we have all existing entries in `editedBy`.
    // ideally we could refactor, perhaps, so that no partial updates are allowed.
    // but for now...
    if (!dealUpdate.tfm && !dealUpdate.tfm.editedBy) {
      const deal = await findOneDeal(dealId);
      editedBy = [
        ...deal.tfm.editedBy,
        newEditedBy,
      ];
    } else {
      editedBy = [
        ...dealUpdate.tfm.editedBy,
        newEditedBy,
      ];
    }
  }

  return {
    editedBy,
  };
};

const updateDeal = async (dealId, dealChanges, user, existingDeal, routePath) => {
  const collection = await db.getCollection('deals');

  let existingDealDetails;
  if (existingDeal && existingDeal.details) {
    existingDealDetails = existingDeal.details;
  }

  let dealChangesDetails;
  if (dealChanges && dealChanges.details) {
    dealChangesDetails = dealChanges.details;
  }

  const update = {
    ...dealChanges,
    details: {
      ...existingDealDetails,
      ...dealChangesDetails,
      dateOfLastAction: now(),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};
exports.updateDeal = updateDeal;

const updateDealEditedByPortal = async (dealId, user) => {
  const collection = await db.getCollection('deals');

  const dealUpdate = await handleEditedByPortal(dealId, {}, user);

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(dealUpdate)),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};
exports.updateDealEditedByPortal = updateDealEditedByPortal;

const addFacilityIdToDeal = async (dealId, newFacilityId, user) => {
  await findOneDeal(dealId, async (deal) => {
    const { facilities } = deal;

    const updatedFacilities = [
      ...facilities,
      newFacilityId,
    ];

    const dealUpdate = {
      ...deal,
      facilities: updatedFacilities,
    };

    const updatedDeal = await updateDeal(
      dealId,
      dealUpdate,
      user,
    );

    return updatedDeal;
  });
};

exports.addFacilityIdToDeal = addFacilityIdToDeal;


const removeFacilityIdFromDeal = async (dealId, facilityId, user) => {
  await findOneDeal(dealId, async (deal) => {
    const { facilities } = deal;

    const updatedFacilities = facilities.filter((f) => f !== facilityId);

    const dealUpdate = {
      ...deal,
      facilities: updatedFacilities,
    };

    const updatedDeal = await updateDeal(
      dealId,
      dealUpdate,
      user,
    );

    return updatedDeal;
  });
};

exports.removeFacilityIdFromDeal = removeFacilityIdFromDeal;

exports.updateDealPut = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      const { user } = req.body;
      const dealUpdate = req.body;
      delete dealUpdate.user;

      const updatedDeal = await updateDeal(
        dealId,
        dealUpdate,
        user,
        deal,
        req.routePath,
      );

      res.status(200).json(updatedDeal);
    }
    res.status(404).send();
  });
};
