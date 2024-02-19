const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');
const { PORTAL_ROUTE } = require('../../../../constants/routes');
const { isNumber } = require('../../../../helpers');
const { DB_COLLECTIONS } = require('../../../../constants');
const { generatePortalUserAuditDetails } = require('../../../../helpers/generateAuditDetails');

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
      if (deal?.editedBy) {
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
    const collection = await db.getCollection(DB_COLLECTIONS.DEALS);
    const editedBy = await handleEditedByPortal(dealId, {}, user);

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(dealId) } },
      $.flatten(withoutId({ editedBy })),
      { returnNewDocument: true, returnDocument: 'after' }
    );

    const { value } = findAndUpdateResponse;
    return value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDealEditedByPortal = updateDealEditedByPortal;

const updateDeal = async (dealId, dealChanges, user, existingDeal, routePath) => {
  try {
    if (ObjectId.isValid(dealId)) {
      const collection = await db.getCollection(DB_COLLECTIONS.DEALS);

      let originalDeal = existingDeal;

      if (!existingDeal) {
        originalDeal = await findOneDeal(dealId);
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
      const auditDetails = generatePortalUserAuditDetails(user._id);

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
        auditDetails,
      };

      if (routePath === PORTAL_ROUTE) {
        update.editedBy = await handleEditedByPortal(dealId, update, user);
      }

      const findAndUpdateResponse = await collection.findOneAndUpdate(
        { _id: { $eq: ObjectId(dealId) } },
        $.flatten(withoutId(update)),
        { returnNewDocument: true, returnDocument: 'after' }
      );

      return findAndUpdateResponse.value;
    }
    return { status: 400, message: 'Invalid Deal Id' };
  } catch (error) {
    console.error('Unable to update the deal %s %s', dealId, error);
    return { status: 500, message: error };
  }
};
exports.updateDeal = updateDeal;

const addFacilityIdToDeal = async (dealId, newFacilityId, user, routePath) => {
  await findOneDeal(dealId, async (deal) => {
    const { facilities } = deal;

    const updatedFacilities = [...facilities, newFacilityId.toHexString()];
    const dealUpdate = { ...deal, facilities: updatedFacilities };

    const response = await updateDeal(dealId, dealUpdate, user, null, routePath);
    const status = isNumber(response?.status, 3);

    if (status) {
      throw new Error({
        status: response.status,
        error: response.message,
      });
    }

    return response;
  });
};

exports.addFacilityIdToDeal = addFacilityIdToDeal;

const removeFacilityIdFromDeal = async (dealId, facilityId, user, routePath) => {
  await findOneDeal(dealId, async (deal) => {
    if (deal?.facilities) {
      const { facilities } = deal;

      const updatedFacilities = facilities.filter((f) => f !== facilityId);

      const dealUpdate = {
        ...deal,
        facilities: updatedFacilities,
      };

      const response = await updateDeal(dealId, dealUpdate, user, null, routePath);
      const status = isNumber(response?.status, 3);

      if (status) {
        throw new Error({
          status: response.status,
          error: response.message,
        });
      }

      return response;
    }

    return null;
  });
};

exports.removeFacilityIdFromDeal = removeFacilityIdFromDeal;

exports.updateDealPut = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }

    const dealId = req.params.id;
    const { user, dealUpdate } = req.body;

    // TODO: Refactor callback with status check
    return await findOneDeal(dealId, async (deal) => {
      if (deal) {
        const response = await updateDeal(
          dealId,
          dealUpdate,
          user,
          deal,
          req.routePath,
        );
        const status = isNumber(response?.status, 3);
        const code = status ? response.status : 200;

        return res.status(code).json(response);
      }

      return res.status(404).send({ status: 404, message: 'Deal not found' });
    });
  } catch (error) {
    console.error('Unable to update deal %s', error);
    return res.status(500).send({ status: 500, message: error });
  }
};
