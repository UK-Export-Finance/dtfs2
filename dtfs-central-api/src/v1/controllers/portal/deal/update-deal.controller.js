const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneBssDeal, findOneGefDeal } = require('./get-deal.controller');
const db = require('../../../../database/mongo-client');
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
    const { username, roles, bank, _id } = user;

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
      const deal = await findOneBssDeal(dealId);
      if (deal && deal.editedBy) {
        editedBy = [...deal.editedBy, newEditedBy];
      } else {
        editedBy = [newEditedBy];
      }
    } else {
      editedBy = [...dealUpdate.editedBy, newEditedBy];
    }
  }

  return editedBy;
};

const updateDealEditedByPortal = async (dealId, user) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('deals');
    const editedBy = await handleEditedByPortal(dealId, {}, user);

    const response = await collection.findOneAndUpdate(
      { _id: ObjectId(dealId) },
      $.flatten(withoutId({ editedBy })),
      { returnDocument: 'after', returnNewDocument: true }
    );

    return response.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDealEditedByPortal = updateDealEditedByPortal;

const updateBssDeal = async (dealId, dealChanges, user, existingDeal, routePath) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('deals');

    let originalDeal = existingDeal;

    if (!existingDeal) {
      originalDeal = await findOneBssDeal(dealId);
    }

    let originalDealDetails;
    if (originalDeal?.details) {
      originalDealDetails = originalDeal.details;
    }

    let dealChangesDetails;
    if (dealChanges?.details) {
      dealChangesDetails = dealChanges.details;
    }

    let originalDealEligibility;
    if (originalDeal?.eligibility) {
      originalDealEligibility = originalDeal.eligibility;
    }

    let dealChangesEligibility;
    if (dealChanges?.eligibility) {
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
      { returnDocument: 'after', returnNewDocument: true }
    );

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateBssDeal = updateBssDeal;

const addFacilityIdToDeal = async (dealId, newFacilityId, user, routePath) => {
  await findOneBssDeal(dealId, async (deal) => {
    const { facilities } = deal;

    const updatedFacilities = [...facilities, newFacilityId.toHexString()];
    const dealUpdate = { ...deal, facilities: updatedFacilities };

    const updatedDeal = await updateBssDeal(dealId, dealUpdate, user, null, routePath);

    return updatedDeal;
  });
};

exports.addFacilityIdToDeal = addFacilityIdToDeal;

const removeFacilityIdFromDeal = async (dealId, facilityId, user, routePath) => {
  await findOneBssDeal(dealId, async (deal) => {
    if (deal && deal.facilities) {
      const { facilities } = deal;

      const updatedFacilities = facilities.filter((f) => f !== facilityId);

      const dealUpdate = {
        ...deal,
        facilities: updatedFacilities,
      };

      const updatedDeal = await updateBssDeal(dealId, dealUpdate, user, null, routePath);

      return updatedDeal;
    }

    return null;
  });
};

exports.removeFacilityIdFromDeal = removeFacilityIdFromDeal;

exports.putBssDeal = async (req, res) => {
  const { id: dealId } = req.params;
  const { user, dealUpdate } = req.body;

  await findOneBssDeal(dealId, async (deal) => {
    if (deal) {
      const updatedDeal = await updateBssDeal(dealId, dealUpdate, user, deal, req.routePath);
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  });
};

const updateGefDeal = async (dealId, update) => {
  const collection = await db.getCollection('deals');

  const dealUpdate = {
    ...update,
    updatedAt: Date.now(),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(dealId) } },
    $.flatten(dealUpdate),
    { returnDocument: 'after', returnNewDocument: true },
  );

  console.info('Portal GEF deal Updated');

  return findAndUpdateResponse.value;
};
exports.updateGefDeal = updateGefDeal;

exports.putGefDeal = async (req, res) => {
  const dealId = req.params.id;

  const { dealUpdate } = req.body;

  await findOneGefDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      const updatedDeal = await updateGefDeal(dealId, dealUpdate);
      return res.status(200).json(updatedDeal);
    }

    return res.status(404).send();
  });
};
