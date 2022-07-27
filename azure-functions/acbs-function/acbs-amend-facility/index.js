/**
* Facility Amendment DOF
* ***********************
* This DOF invokes following activity functions to satisfy mandatory amendments ACs
* 1. activity-get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
* 2. activity-update-facility-master: Update ACBS `Facility Master Record`
* 3. activity-amend-facility-loan: Update ACBS `Facility Loan Record`
*
* Durable Orchestration Function (DOF)
* ------------------------------------
* This function is not intended to be invoked directly.
* This function is trigger by an HTTP starter function (acbs-http).
*
* Prerequisites
* -------------
* 0. 'npm install durable-functions'
* 1. Durable HTTP starter function (acbs-http)
* 2. Durable activity function (activity-get-facility-master, activity-update-facility-master)
*/

const df = require('durable-functions');
const retryOptions = require('../helpers/retryOptions');
const mappings = require('../mappings');

module.exports = df.orchestrator(function* amendACBSFacility(context) {
  try {
    const { amendment } = context.df.getInput();
    if (amendment) {
    // UKEF Facility ID exists in the payload
      const hasFacilityId = Boolean(amendment.facilityId);
      // At least one of the amendment exists in the payload
      const hasAmendment = Boolean(amendment.amount) || Boolean(amendment.coverEndDate);
      // Facility object existence check
      const hasFacility = amendment.facility;
      // Deal properties existence check
      const hasDeal = amendment.deal && Object.prototype.hasOwnProperty.call(amendment.deal, 'dealSnapshot');

      // Payload verification
      if (hasFacilityId && hasAmendment && hasFacility && hasDeal) {
        const { facility, deal, facilityId } = amendment;

        // 1. DAF : activity-get-facility-master: Retrieve ACBS `Facility Master Record` with eTag
        const { acbsFacility: fmr, etag } = yield context.df.callActivityWithRetry(
          'activity-get-facility-master',
          retryOptions,
          { facilityId },
        );

        if (!!fmr && !!etag) {
          let facilityMasterRecordAmendments;
          let facilityLoanRecordAmendments;
          const amendments = {
            amendment,
          };

          /**
          * *************************** AMENDMENT MAPPING ***************************
          */

          // 2.1. Facility Master Record (FMR)
          const fmrMapped = mappings.facility.facilityMasterAmend(fmr, amendments, deal);

          // 2.2. FMR update
          // 2.2.1 - UKEF Exposure
          if (amendment.amount) {
            const result = yield context.df.callActivityWithRetry(
              'activity-update-facility-master',
              retryOptions,
              {
                facilityId,
                acbsFacilityMasterInput: fmrMapped,
                updateType: 'amendAmount',
                etag,
              },
            );

            facilityMasterRecordAmendments = {
              amount: {
                ...result,
              },
            };
          }

          // 2.2.2. DAF : activity-get-facility-master: Retrieve ACBS `Facility Master Record` with new eTag
          const updatedFmr = yield context.df.callActivityWithRetry(
            'activity-get-facility-master',
            retryOptions,
            { facilityId },
          );

          // 2.2.3 - Cover end date
          if (amendment.coverEndDate && updatedFmr.etag) {
            const result = yield context.df.callActivityWithRetry(
              'activity-update-facility-master',
              retryOptions,
              {
                facilityId,
                acbsFacilityMasterInput: fmrMapped,
                updateType: 'amendExpiryDate',
                etag: updatedFmr.etag,
              },
            );

            facilityMasterRecordAmendments = {
              ...facilityMasterRecordAmendments,
              coverEndDate: {
                ...result,
              },
            };
          }

          // 2.2. Facility Loan Record (FLR)
          const flrMApped = mappings.facility.facilityLoanAmend(amendments, facility);

          // 2.3 FLR update
          // 2.3.1 Extract loan id for facility id
          const loanId = yield context.df.callActivityWithRetry(
            'activity-get-loan-id',
            retryOptions,
            {
              facilityId,
            },
          );

          if (loanId) {
          // 2.3.2 - UKEF Exposure
          // TODO : Facility loan amount API

            // 2.3.3 - Cover end date
            if (amendment.coverEndDate) {
              const result = yield context.df.callActivityWithRetry(
                'activity-update-facility-loan',
                retryOptions,
                {
                  loanId,
                  facilityId,
                  acbsFacilityLoanInput: flrMApped,
                },
              );

              facilityLoanRecordAmendments = {
                ...facilityLoanRecordAmendments,
                coverEndDate: {
                  ...result,
                },
              };
            }
          }

          return {
            facilityId,
            loanId,
            facilityMasterRecordAmendments,
            facilityLoanRecordAmendments,
          };
        }
        throw new Error('ACBS facility amendment error : Unable to retrieve FMR.');
      }
    }

    throw new Error('Void argument set');
  } catch (e) {
    console.error('ACBS facility amendment error: ', { e });
    return e;
  }
});
