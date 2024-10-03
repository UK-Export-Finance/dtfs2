/**
 * ACBS Amend Facility Orchestration Function
 * ------------------------------------------
 * This module defines a Durable Orchestration Function (DOF) for amending facility records in the ACBS system.
 * The function is triggered by an HTTP trigger function (`acbs-http`) and performs various amendments to facility records.
 *
 * Amendments
 * ----------
 * 1. amend-facility-master: Updates the ACBS `Facility Master Record`
 * 2. amend-facility-covenant: Updates the ACBS `Facility Covenant Record`
 * 3. amend-facility-guarantee: Updates the ACBS `Facility Guarantee Record`
 * 4. amend-facility-loan: Updates the ACBS `Facility Loan Record`
 * 5. amend-facility-fixed-fee: Updates the ACBS `Facility Fixed Fee Record`
 *
 * Durable Orchestration Function (DOF)
 * ------------------------------------
 * This function is not intended to be invoked directly.
 * It is triggered by an HTTP trigger function (`acbs-http`).
 *
 * Check
 * -----
 * 1. Only facilities with stage `07` (Issued) are acceptable.
 *
 * Prerequisites
 * -------------
 * 0. Run 'npm install durable-functions' to install the required durable functions package.
 * 1. Ensure the Durable HTTP trigger function (`acbs-http`) is set up.
 * 2. Ensure the Durable activity functions (`get-facility-master`, `update-facility-master`) are set up.
 *
 * Orchestration Function
 * ----------------------
 * - `amendFacility`: Main orchestration function for amending facility records.
 *   - Validates the amendment payload.
 *   - Checks for the existence of required properties in the payload.
 *   - Throws errors for invalid payloads.
 *   - Processes amendments based on the facility ID and other properties.
 *
 * @module acbs-amend-facility
 */

const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const { DEAL, FACILITY } = require('../../constants');

const acceptableFacilityStage = ['07'];

df.app.orchestration('acbs-amend-facility', function* amendFacility(context) {
  const payload = context.df.input;

  try {
    const { amendment } = payload;

    if (!amendment) {
      throw new Error('Invalid amendment payload');
    }

    const { facilityId, amount, coverEndDate } = amendment;

    // UKEF Facility ID exists in the payload
    const hasFacilityId = Boolean(facilityId);
    // At least one of the amendment exists in the payload
    const hasAmendment = Boolean(amount) || Boolean(coverEndDate);
    // Facility object existence check
    const hasFacility = amendment.facility;
    // Deal properties existence check
    const hasDeal = amendment.deal && amendment.deal.dealSnapshot;

    // Payload verification
    if (!hasFacilityId || !hasAmendment || !hasFacility || !hasDeal) {
      throw new Error('Invalid argument set provided');
    }

    const { facility, deal } = amendment;
    const { facilitySnapshot } = facility;
    let facilityLoanRecord;

    if (facilityId.includes(DEAL.UKEF_ID.PENDING) || facilityId.includes(DEAL.UKEF_ID.TEST)) {
      throw new Error(`Invalid facility ID ${facilityId}`);
    }

    // 1. DAF : get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
    const { acbsFacility: fmr, etag } = yield context.df.callActivityWithRetry('get-facility-master', retryOptions, facilityId);

    /**
     * Check 1 - Facility stage `07` (issued) only
     * Ensure facility is `Issued` before processing amendment payload
     */
    const { facilityStageCode } = fmr;

    if (!acceptableFacilityStage.includes(facilityStageCode)) {
      // Error upon unacceptable facility stage
      const incorrectFacilityStageErrorMessage = `Facility ${facilityId} stage is ${facilityStageCode}, amendments are accepted for 07 stage.`;

      console.error(incorrectFacilityStageErrorMessage);

      return {
        facilityId,
        facilityMasterRecord: {
          error: incorrectFacilityStageErrorMessage,
        },
        facilityCovenantRecord: {
          error: incorrectFacilityStageErrorMessage,
        },
        facilityGuaranteeRecord: {
          error: incorrectFacilityStageErrorMessage,
        },
        facilityLoanRecord: {
          error: incorrectFacilityStageErrorMessage,
        },
        facilityFixedFeeRecord: {
          error: incorrectFacilityStageErrorMessage,
        },
      };
    }

    if (!fmr || !etag || !facilitySnapshot) {
      throw new Error('ACBS facility amendment error : Unable to retrieve FMR');
    }

    const amendments = {
      amendment,
    };

    /**
     * *************************** AMENDMENT SOFs ***************************
     */

    // 1. SOF: Facility Loan Record (FLR)
    // `Bond` facility only
    if (facilitySnapshot.type === FACILITY.FACILITY_TYPE.BOND) {
      facilityLoanRecord = context.df.callSubOrchestrator('acbs-amend-facility-loan-record', {
        facilityId,
        facility,
        amendments,
        fmr,
      });

      yield context.df.Task.all([facilityLoanRecord]);
    } else {
      facilityLoanRecord = {
        result: `Facility type ${facilitySnapshot.type} will not be amended.`,
      };
    }

    // 2. SOF: Facility Master Record (FMR)
    const facilityMasterRecord = context.df.callSubOrchestrator('acbs-amend-facility-master-record', {
      deal,
      facilityId,
      fmr,
      etag,
      amendments,
    });
    yield context.df.Task.all([facilityMasterRecord]);

    // 3. SOF: Facility Covenant Record (FCR)
    const facilityCovenantRecord = context.df.callSubOrchestrator('acbs-amend-facility-covenant-record', {
      facilityId,
      amendments,
    });

    yield context.df.Task.all([facilityCovenantRecord]);

    // 4. SOF: Facility Guarantee Record (FGR)
    const facilityGuaranteeRecord = context.df.callSubOrchestrator('acbs-amend-facility-guarantee-record', {
      facilityId,
      amendments,
    });

    // 5. SOF: Facility Fixed Fee Record (FFFR)
    const facilityFixedFeeRecord = context.df.callSubOrchestrator('acbs-amend-facility-fixed-fee-record', {
      facilityId,
      amendments,
    });

    yield context.df.Task.all([facilityGuaranteeRecord]);

    return {
      facilityId,
      facilityMasterRecord: facilityMasterRecord.result,
      facilityCovenantRecord: facilityCovenantRecord.result,
      facilityGuaranteeRecord: facilityGuaranteeRecord.result,
      facilityLoanRecord: facilityLoanRecord.result,
      facilityFixedFeeRecord: facilityFixedFeeRecord.result,
    };
  } catch (error) {
    console.error('Error amending facility records %o', error);
    return false;
  }
});
