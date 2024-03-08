/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 *
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *    function app in Kudu
 */

const df = require('durable-functions');
const retryOptions = require('../helpers/retryOptions');
const mappings = require('../mappings');
const CONSTANTS = require('../constants');

module.exports = df.orchestrator(function* updateACBSfacility(context) {
  try {
    const { facilityId, facility, deal } = context.df.getInput();

    if (facilityId.includes(CONSTANTS.DEAL.UKEF_ID.PENDING) || facilityId.includes(CONSTANTS.DEAL.UKEF_ID.TEST)) {
      throw new Error('Invalid facility ID %d', facilityId);
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
      const { acbsFacility, etag } = yield context.df.callActivityWithRetry('activity-get-facility-master', retryOptions, { facilityId });

      if (acbsFacility && etag) {
        // 2.1. Create updated facility master record object
        const acbsFacilityMasterInput = mappings.facility.facilityUpdate(facilitySnapshot, acbsFacility, deal);

        // 2.2. PUT updated facility master record object
        const issuedFacilityMaster = yield context.df.callActivityWithRetry('activity-update-facility-master', retryOptions, {
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
        const facilityLoan = yield context.df.callActivityWithRetry('activity-create-facility-loan', retryOptions, { facilityIdentifier: facilityId, acbsFacilityLoanInput });

        // 4.1. Map Facility fixed-fee / premium schedule record(s)
        const acbsFacilityFeeInput = mappings.facility.facilityFee(deal, facilitySnapshot);

        // 4.2. Facility fixed-fee record(s) creation
        if (Array.isArray(acbsFacilityFeeInput)) {
          facilityFee = [];
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < acbsFacilityFeeInput.length; i++) {
            const input = acbsFacilityFeeInput[i];
            facilityFee.push(yield context.df.callActivityWithRetry('activity-create-facility-fee', retryOptions, { facilityIdentifier: facilityId, acbsFacilityFeeInput: input }));
          }
        } else {
          facilityFee = yield context.df.callActivityWithRetry('activity-create-facility-fee', retryOptions, { facilityIdentifier: facilityId, acbsFacilityFeeInput });
        }

        return {
          facilityId: facility._id,
          issuedFacilityMaster,
          facilityLoan,
          facilityFee,
        };
      }
    }

    throw new Error('Invalid argument set');
  } catch (error) {
    console.error('Error processing facility issuance: %o', error);
    throw new Error('Error processing facility issuance %o', error);
  }
});
