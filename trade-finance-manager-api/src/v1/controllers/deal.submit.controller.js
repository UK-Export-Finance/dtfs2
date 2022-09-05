const { ObjectId } = require('bson');
const { getCollection } = require('../../drivers/db-client');
const {
  findOneTfmDeal,
  findOnePortalDeal,
  findOneGefDeal,
} = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const addFirstTaskEmailSentFlag = require('./deal-add-tfm-data/add-first-task-email-sent-flag');
const { updateFacilities } = require('./update-facilities');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');

const addTfmDealData = require('./deal-add-tfm-data');
const dealStage = require('./deal-add-tfm-data/dealStage');
const { updatedIssuedFacilities } = require('./update-issued-facilities');
const { updatePortalDealStatus } = require('./update-portal-deal-status');
const CONSTANTS = require('../../constants');
const api = require('../api');
const { createEstoreFolders } = require('./estore.controller');
const acbsController = require('./acbs.controller');
const dealController = require('./deal.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const {
  sendDealSubmitEmails,
  sendAinMinAcknowledgement,
  sendMigratedDealEmail,
} = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const dealHasAllUkefIds = require('../helpers/dealHasAllUkefIds');

const getDeal = async (dealId, dealType) => {
  let deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    deal = await findOneGefDeal(dealId);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    deal = await findOnePortalDeal(dealId);
  }

  return deal;
};

/** Only create the TFM record until UKEFids have been generated, then process the submission
 * This allows a deal in Pending state to be seen in TFM,
 * which indicates to UKEF that a deal has been submitted before UKEFids are generated
 * */

const submitDealBeforeUkefIds = async (dealId, dealType) => {
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    console.error('TFM API - submitDealBeforeUkefIds - deal not found');
    return false;
  }

  return api.submitDeal(dealType, dealId);
};
exports.submitDealBeforeUkefIds = submitDealBeforeUkefIds;

/**
 * Following function is only triggered once
 * the number has been granted by the number generator
 * Azure function
 */
const submitDealAfterUkefIds = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);
  const migrationScript = Boolean(process.env.DATA_MIGRATION_SCRIPT);
  console.info('UKEF IDs verified');

  if (!deal) {
    console.error('TFM API - submitDealAfterUkefIds - deal not found ', dealId);
    return false;
  }

  const submittedDeal = await api.submitDeal(dealType, dealId);
  const mappedDeal = mapSubmittedDeal(submittedDeal);

  const { submissionCount } = mappedDeal;
  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;

  if (firstDealSubmission || migrationScript) {
    await updatePortalDealStatus(mappedDeal);
    const dealWithTfmData = await addTfmDealData(mappedDeal);
    const updatedDealWithPartyUrn = await addPartyUrns(dealWithTfmData);
    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPartyUrn);
    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithDealCurrencyConversions);
    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);
    const dealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

    if (mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || mappedDeal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      // Below is commented solely for the purpose of TFM data migration
      // const dealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      /**
       * Current requirement only allows AIN & MIN deals to be sent to ACBS
       * This calls CREATES Deal & Facility ACBS records
       */
      if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType)) {
        // await dealController.submitACBSIfAllPartiesHaveUrn(dealId);
      }

      const { firstTaskEmail } = await sendDealSubmitEmails(dealWithTasks);

      /**
       * Add an emailSent flag to the first task.
       * This prevents multiple emails from being sent.
      */
      const updatedDealWithTasks = dealWithTasks;
      updatedDealWithTasks.tfm.tasks = addFirstTaskEmailSentFlag(firstTaskEmail, dealWithTasks.tfm.tasks);

      /**
       * Update the deal with all the above modifications
       * Note: at the time of writing, some functions above update the deal, others do not.
       */
      return api.updateDeal(dealId, updatedDealWithTasks);
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit && migrationScript) {
    const { tfm: tfmDeal } = await findOneTfmDeal(dealId);

    /**
     * checks if can update to MIN
     * if it can, changes mappedDeal to show MIN to allow gef fee record to be calculated
     * isUpdatingToMIN then also used to update deal to MIN
    */
    const isUpdatingToMIN = shouldUpdateDealFromMIAtoMIN(mappedDeal, tfmDeal);
    if (isUpdatingToMIN) {
      mappedDeal.submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.MIN;
    }
    const updatedDeal = await updatedIssuedFacilities(mappedDeal);
    /**
     * Current requirement only allows AIN & MIN deals to be send to ACBS
     * This call UPDATES facility record by updating their stage from
     * Unissued (06) to Issued (07)
     */
    if (dealController.canDealBeSubmittedToACBS(mappedDeal.submissionType)) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (isUpdatingToMIN) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, dealType, checker);

      // NOTE: this is the one and only time that TFM updates a snapshot.
      // Without this, it would involve additional API calls going around in circles.
      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      updatedDeal.submissionType = dealSnapshot.submissionType;
      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.manualInclusionNoticeSubmissionDate;
        updatedDeal.checkerMIN = dealSnapshot.checkerMIN;
      } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        updatedDeal.manualInclusionNoticeSubmissionDate = dealSnapshot.details.manualInclusionNoticeSubmissionDate;
        updatedDeal.checkerMIN = dealSnapshot.details.checkerMIN;
      }
      if (dealController.canDealBeSubmittedToACBS(portalMINUpdate.submissionType)) {
        await dealController.submitACBSIfAllPartiesHaveUrn(dealId);
      }
      await sendAinMinAcknowledgement(updatedDeal);

      // if changed to MIN, status should be updated to confirmed
      const updatedDealStage = dealStage(mappedDeal.status, mappedDeal.submissionType);
      updatedDeal.tfm.stage = updatedDealStage;
    }
    await updatePortalDealStatus(updatedDeal);

    return api.updateDeal(dealId, updatedDeal);
  }
  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDealAfterUkefIds = submitDealAfterUkefIds;

// function used only for deals that have been migrated
// note: this should not be used anymore once the migration for Amendments is complete
const submitMigratedDeal = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    console.error('TFM API - submitDealAfterUkefIds - deal not found ', dealId);
    return false;
  }
  const facilitiesCollection = await getCollection('facilities');
  const facilities = await facilitiesCollection.find({ dealId: ObjectId(deal._id) }).toArray();
  if (facilities) {
    deal.facilities = facilities;
  }

  const mappedDeal = mapSubmittedDeal({ dealSnapshot: deal });

  const updatedDeal = await updatedIssuedFacilities(mappedDeal);

  const isUpdatingToMIN = deal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA;

  if (isUpdatingToMIN) {
    const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, dealType, checker);
    updatedDeal.submissionType = CONSTANTS.DEALS.SUBMISSION_TYPE.MIN;
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      updatedDeal.manualInclusionNoticeSubmissionDate = portalMINUpdate.manualInclusionNoticeSubmissionDate;
      updatedDeal.checkerMIN = portalMINUpdate.checkerMIN;
    } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      updatedDeal.manualInclusionNoticeSubmissionDate = portalMINUpdate.details.manualInclusionNoticeSubmissionDate;
      updatedDeal.checkerMIN = portalMINUpdate.details.checkerMIN;
    }

    await sendAinMinAcknowledgement(updatedDeal);
  }

  // ACBS interaction : AIN or MIN only
  if (dealController.canDealBeSubmittedToACBS(updatedDeal.submissionType)) {
    console.info('Migrated deal ACBS interaction initiated: ', dealId);

    // Add `updatedDeal` deal object to `migratedDeals` collection
    const migratedDealToGo = {
      ...updatedDeal,
      issueFacility: [],
    };

    // Issue facility ACBS JSON
    updatedDeal.facilities.filter((facility) => facility.hasBeenIssued).map((facility) => migratedDealToGo.issueFacility.push(
      {
        facilityId: facility.ukefFacilityId,
        facility,
        deal: {
          dealSnapshot: {
            dealType: deal.dealType,
            submissionType: deal.submissionType,
            submissionDate: deal.submissionDate,
          },
          exporter: {
            ...deal.exporter,
          },
        },
      },
    ));

    const migratedDeals = await getCollection('migratedDeals');
    migratedDeals.insertOne(migratedDealToGo);

    // ACBS
    await dealController.submitACBSIfAllPartiesHaveUrn(dealId);

    // Send notification email
    await sendMigratedDealEmail(dealId);
  }

  await updatePortalDealStatus(updatedDeal);

  return true;
};

const submitDealPUT = async (req, res) => {
  const { dealId, dealType, checker } = req.body;
  let deal;

  const { status: canSubmitDealAfterUkefIds, message } = await dealHasAllUkefIds(dealId);
  const migrationScript = Boolean(process.env.DATA_MIGRATION_SCRIPT);
  // check if the deal has been migrated from Portal V1 to Portal v2
  if (message === 'Migrated deal' && !migrationScript) {
    console.info('Submitting a migrated deal', dealId);
    deal = await submitMigratedDeal(dealId, dealType, checker);
  } else {
    console.info('Submitting a brand new deal', dealId, canSubmitDealAfterUkefIds);
    if (canSubmitDealAfterUkefIds || migrationScript) {
      deal = await submitDealAfterUkefIds(dealId, dealType, checker);
    } else {
      deal = await submitDealBeforeUkefIds(dealId, dealType);
    }
  }

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};

exports.submitDealPUT = submitDealPUT;

const submitDealAfterUkefIdsPUT = async (req, res) => {
  const { dealId, dealType, checker } = req.body;

  const deal = await submitDealAfterUkefIds(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};

exports.submitDealAfterUkefIdsPUT = submitDealAfterUkefIdsPUT;
