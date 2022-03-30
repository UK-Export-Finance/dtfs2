const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');
const { PORTAL_ROUTE } = require('../../../../constants/routes');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const handleEditedByPortal = async (dealId, dealUpdate, user) => {
  let editedBy = [];

  // sometimes we don't have a user making changes.
  // some deal updates do not want to be marked as "edited by X user"
  // for example when a Checker submits a deal, they have not 'edited' the deal, only submitted it.
  if (user) {
    const {
      username,
      roles,
      bank,
      _id,
    } = user;

    const newEditedBy = {
      date: Date.now(),
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
      if (deal && deal.editedBy) {
        editedBy = [
          ...deal.editedBy,
          newEditedBy,
        ];
      } else {
        editedBy = [
          newEditedBy,
        ];
      }
    } else {
      editedBy = [
        ...dealUpdate.editedBy,
        newEditedBy,
      ];
    }
  }

  return editedBy;
};

const updateDealEditedByPortal = async (dealId, user) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('deals');
    const editedBy = await handleEditedByPortal(dealId, {}, user);

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: ObjectId(dealId) },
      $.flatten(withoutId({ editedBy })),
      { returnOriginal: false },
    );

    const { value } = findAndUpdateResponse;
    return value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDealEditedByPortal = updateDealEditedByPortal;

const updateDeal = async (dealId, dealChanges, user, existingDeal, routePath) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('deals');

    let originalDeal = existingDeal;

    if (!existingDeal) {
      originalDeal = await findOneDeal(dealId);
    }

    let originalDealDetails;
    if (originalDeal && originalDeal.details) {
      originalDealDetails = originalDeal.details;
    }

    let dealChangesDetails;
    if (dealChanges && dealChanges.details) {
      dealChangesDetails = dealChanges.details;
    }

    let originalDealEligibility;
    if (originalDeal && originalDeal.eligibility) {
      originalDealEligibility = originalDeal.eligibility;
    }

    let dealChangesEligibility;
    if (dealChanges && dealChanges.eligibility) {
      dealChangesEligibility = dealChanges.eligibility;
    }

    const update = {
      ...dealChanges,
      updatedAt: Date.now(),
      details: {
        ...originalDealDetails,
        ...dealChangesDetails,
      },
      eligibility: {
        ...originalDealEligibility,
        ...dealChangesEligibility,
      },
    };

    if (routePath === PORTAL_ROUTE) {
      update.editedBy = await handleEditedByPortal(dealId, update, user);
    }

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: ObjectId(dealId) },
      $.flatten(withoutId(update)),
      { returnOriginal: false },
    );

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDeal = updateDeal;

exports.updateDealPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const dealId = req.params.id;

    const { user, dealUpdate } = req.body;

    await findOneDeal(dealId, async (deal) => {
      if (deal) {
        const updatedDeal = await updateDeal(
          dealId,
          dealUpdate,
          user,
          deal,
          req.routePath,
        );
        return res.status(200).json(updatedDeal);
      }
      return res.status(404).send({ status: 404, message: 'Deal not found' });
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};
