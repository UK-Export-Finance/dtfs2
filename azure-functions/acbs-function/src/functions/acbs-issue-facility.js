/**
 * ACBS Issue Facility Orchestration Function
 * ------------------------------------------
 * This module defines a Durable Orchestration Function (DOF) for issuing facility records in the ACBS system.
 * The function is triggered by an HTTP trigger function and performs various operations to issue a facility.
 *
 * Operations
 * ----------
 * 1. GET Facility master record object
 * 2. Create updated facility master record object
 * 3. PUT updated facility master record object
 * 4. Create facility loan record
 * 5. Create facility fixed fee record
 *
 * Durable Orchestration Function (DOF)
 * ------------------------------------
 * This function is not intended to be invoked directly.
 * It is triggered by an HTTP trigger function.
 *
 * Prerequisites
 * -------------
 * 0. Run 'npm install durable-functions' to install the required durable functions package.
 * 1. Ensure the Durable HTTP trigger function is set up.
 * 2. Ensure the Durable activity functions (`get-facility-master`, `update-facility-master`) are set up.
 *
 * Orchestration Function
 * ----------------------
 * - `issueFacility`: Main orchestration function for issuing facility records.
 *   - Validates the facility ID.
 *   - Retrieves the facility master record.
 *   - Creates and updates the facility master record.
 *   - Updates the ACBS parties information.
 *
 * @module acbs-issue-facility
 */

const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');
const CONSTANTS = require('../../constants');

df.app.orchestration('acbs-issue-facility', function* issueFacility(context) {
  const payload = context.df.input;

  try {
    const { facilityId, facility, deal } = payload;

    if (facilityId.includes(CONSTANTS.DEAL.UKEF_ID.PENDING) || facilityId.includes(CONSTANTS.DEAL.UKEF_ID.TEST)) {
      throw new Error(`Invalid facility ID ${facilityId}`);
    }

    let facilityFee;
    // Constants declaration for mapping functions
    const acbsParties = {
      parties: {
        exporter: {},
      },
    };
    const facilitySnapshot = {
      tfm: {
        ...facility.tfm,
      },
      facilitySnapshot: {
        ...facility,
        currency: {
          id: facility.currencyCode,
        },
      },
      update: {},
    };

    if (facilityId) {
      // 1. GET Facility master record object
      const { acbsFacility, etag } = yield context.df.callActivityWithRetry('get-facility-master', retryOptions, facilityId);

      if (acbsFacility && etag) {
        // 2.1. Create updated facility master record object
        const acbsFacilityMasterInput = mappings.facility.facilityUpdate(facilitySnapshot, acbsFacility, deal);

        // 2.2. PUT updated facility master record object
        const issuedFacilityMaster = yield context.df.callActivityWithRetry('update-facility-master', retryOptions, {
          facilityId,
          acbsFacilityMasterInput,
          updateType: CONSTANTS.FACILITY.OPERATION.ISSUE,
          etag,
        });

        // Records only created for `Issued` and `Activated` facilities only
        // Loan record consumes ACBS exporter ID, extracted from master facility record
        acbsParties.parties.exporter = {
          partyIdentifier: acbsFacility.dealBorrowerIdentifier,
        };
        facilitySnapshot.update = {
          ...acbsFacilityMasterInput,
        };

        // 3.1. Facility loan record
        const acbsFacilityLoanInput = mappings.facility.facilityLoan(deal, facilitySnapshot, acbsParties);

        // 3.2. Create facility loan record
        const facilityLoan = yield context.df.callActivityWithRetry('create-facility-loan', retryOptions, {
          facilityIdentifier: facilityId,
          acbsFacilityLoanInput,
        });

        // 4.1. Map Facility fixed-fee / premium schedule record(s)
        const acbsFacilityFeeInput = mappings.facility.facilityFee(deal, facilitySnapshot);

        // 4.2. Facility fixed-fee record(s) creation
        if (Array.isArray(acbsFacilityFeeInput)) {
          facilityFee = [];
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < acbsFacilityFeeInput.length; i++) {
            const input = acbsFacilityFeeInput[i];
            facilityFee.push(
              yield context.df.callActivityWithRetry('create-facility-fee', retryOptions, {
                facilityIdentifier: facilityId,
                acbsFacilityFeeInput: input,
              }),
            );
          }
        } else {
          facilityFee = yield context.df.callActivityWithRetry('create-facility-fee', retryOptions, {
            facilityIdentifier: facilityId,
            acbsFacilityFeeInput,
          });
        }

        return {
          facilityId: facility._id,
          issuedFacilityMaster,
          facilityLoan,
          facilityFee,
        };
      }
    }

    throw new Error('Invalid argument set provided');
  } catch (error) {
    console.error('Error processing facility issuance %o', error);
    throw new Error(`Error processing facility issuance ${error}`);
  }
});
