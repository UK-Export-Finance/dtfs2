const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { DealNotFoundError } = require('@ukef/dtfs2-common');
const { findOneDeal } = require('./get-deal.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { ROUTES } = require('../../../../constants');
const { isNumber } = require('../../../../helpers');

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
      const deal = await findOneDeal(dealId);
      if (deal?.editedBy) {
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

const updateDealEditedByPortal = async ({ dealId, user, auditDetails }) => {
  if (!ObjectId.isValid(dealId)) {
    return { status: 400, message: 'Invalid Deal Id' };
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const { _id, ...editedByWithoutId } = await handleEditedByPortal(dealId, {}, user);
  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(dealId) } }, $.flatten({ editedBy: editedByWithoutId, auditRecord }), {
    returnNewDocument: true,
    returnDocument: 'after',
  });

  const { value } = findAndUpdateResponse;
  return value;
};

exports.updateDealEditedByPortal = updateDealEditedByPortal;

/**
 * Updates a deal in the database.
 * @param {Object} params - The parameters for updating the deal.
 * @param {string} params.dealId - The ID of the deal being updated.
 * @param {Object} params.dealUpdate - The update to be made to the deal.
 * @param {Object} params.user - The user making the changes.
 * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - The audit details for the update.
 * @param {Object} params.existingDeal - The existing deal object.
 * @param {string} params.routePath - The route path.
 * @returns {Promise<{ status: number, message: string }>} The updated deal object.
 */
const updateDeal = async ({ dealId, dealUpdate, user, auditDetails, existingDeal, routePath }) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    let originalDeal = existingDeal;

    if (!existingDeal) {
      originalDeal = await findOneDeal(dealId);
    }

    let originalDealDetails;
    let originalDealEligibility;

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const dealUpdateForDatabase = {
      ...dealUpdate,
      auditRecord,
      updatedAt: Date.now(),
    };

    if (originalDeal?.details) {
      originalDealDetails = originalDeal.details;
    }

    if (originalDeal?.eligibility) {
      originalDealEligibility = originalDeal.eligibility;
    }

    /**
     * This function is invoked numerous times when a deal status is updated.
     * For instance upon submitting this deal to the TFM (from checker) the
     * deal status will be updated to `Submitted` (`deal.status`), the submission count will be
     * incremented (`deal.details.submissionCount`) and facilities updated at (`deal.facilitiesUpdated`).
     *
     * When multiple simultaneous calls are made to `updateDeal` function, a race condition is developed
     * where chances are increased per number of facilities associated with the deal.
     *
     * Below validation ensures only latest updates pertinent to the respective deal properties `details`
     * and `eligibility` are only added to the `update` deal object when applicable. This ensures no outdated
     * `details` and `eligibility` object are spread or injected from other concurrent calls where deal object
     * is extracted at the begining of this function.
     */

    if (dealUpdate?.details) {
      dealUpdateForDatabase.details = {
        ...originalDealDetails,
        ...dealUpdate.details,
      };
    }

    if (dealUpdate?.eligibility) {
      dealUpdateForDatabase.eligibility = {
        ...originalDealEligibility,
        ...dealUpdate.eligibility,
      };
    }

    if (routePath === ROUTES.PORTAL_ROUTE) {
      dealUpdateForDatabase.editedBy = await handleEditedByPortal(dealId, dealUpdateForDatabase, user);
    }
    const { _id, ...dealUpdateForDatabaseWithoutId } = dealUpdateForDatabase;

    const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(dealId) } }, $.flatten(dealUpdateForDatabaseWithoutId), {
      returnNewDocument: true,
      returnDocument: 'after',
    });

    return findAndUpdateResponse.value;
  } catch (error) {
    console.error('Unable to update the deal %s %o', dealId, error);
    return { status: 500, message: error };
  }
};
exports.updateDeal = updateDeal;

const addFacilityIdToDeal = async (dealId, newFacilityId, user, routePath, auditDetails) => {
  await findOneDeal(dealId, async (deal) => {
    if (!deal) {
      throw new DealNotFoundError(dealId);
    }

    const { facilities } = deal;

    const updatedFacilities = [...facilities, newFacilityId.toHexString()];
    const dealUpdate = { ...deal, facilities: updatedFacilities };

    const response = await updateDeal({ dealId, dealUpdate, user, auditDetails, existingDeal: null, routePath });
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

const removeFacilityIdFromDeal = async (dealId, facilityId, user, routePath, auditDetails) => {
  await findOneDeal(dealId, async (deal) => {
    if (deal?.facilities) {
      const { facilities } = deal;

      const updatedFacilities = facilities.filter((f) => f !== facilityId);

      const dealUpdate = {
        ...deal,
        facilities: updatedFacilities,
      };

      const response = await updateDeal({ dealId, dealUpdate, user, auditDetails, existingDeal: null, routePath });
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
    const {
      params: { id: dealId },
      body: { user, dealUpdate, auditDetails },
      routePath,
    } = req;

    if (!ObjectId.isValid(dealId)) {
      return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }

    try {
      validateAuditDetails(auditDetails);
    } catch (error) {
      if (error instanceof InvalidAuditDetailsError) {
        return res.status(error.status).send({
          status: error.status,
          message: error.message,
          code: error.code,
        });
      }
      return res.status(500).send({ status: 500, error });
    }
    // TODO: Refactor callback with status check
    return findOneDeal(dealId, async (existingDeal) => {
      if (!existingDeal) {
        return res.status(404).send({ status: 404, message: 'Deal not found' });
      }
      const response = await updateDeal({ dealId, dealUpdate, user, auditDetails, existingDeal, routePath });
      const status = isNumber(response?.status, 3);
      const code = status ? response.status : 200;

      return res.status(code).json(response);
    });
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    console.error('Unable to update deal %o', error);
    return res.status(500).send({ status: 500, message: error });
  }
};
