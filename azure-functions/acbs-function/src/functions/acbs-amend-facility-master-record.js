/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Facility Master Record amendment SOF
 * **********************************
 * This is a sub-orchestrated function invoked from it's master orchestrator.
 * `acbs-amend-facility` is the master orchestrator for this function.
 *
 * Sub-Orchestration Function (SOF)
 * --------------------------------
 * This function cannot be invoked directly and must be invoked by a DOF.
 *
 * Prerequisites
 * -------------
 * 0. 'npm install durable-functions'
 * 1. Durable HTTP trigger function (acbs-http)
 * 2. DOF (acbs-amend-facility)
 * 3. DAF (update-facility-master, get-facility-master)
 *
 * ACBS
 * ----
 * This function is responsible for amending FMR.
 * FMR is a parent record, created for every facility.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

df.app.orchestration('acbs-amend-facility-master-record', function* amendFacilityMaster(context) {
  const payload = context.df.input;

  try {
    if (payload) {
      const { deal, facilityId, fmr, etag, amendments } = payload;
      const { amendment } = amendments;
      let facilityMasterRecordAmendments;

      // 2.1. Facility Master Record (FMR) mapping
      const fmrMapped = mappings.facility.facilityMasterAmend(fmr, amendments, deal);

      // 2.2.1 - UKEF Exposure
      if (amendment.amount) {
        const amount = yield context.df.callActivityWithRetry('update-facility-master', retryOptions, {
          facilityId,
          acbsFacilityMasterInput: fmrMapped,
          updateType: 'amendAmount',
          etag,
        });

        facilityMasterRecordAmendments = {
          amount,
        };
      }

      // 2.2.2 - Cover end date
      if (amendment.coverEndDate) {
        // 2.2.3. DAF : get-facility-master: Retrieve ACBS `Facility Master Record` with new eTag
        const updatedFmr = yield context.df.callActivityWithRetry('get-facility-master', retryOptions, facilityId);

        if (updatedFmr.etag) {
          const coverEndDate = yield context.df.callActivityWithRetry('update-facility-master', retryOptions, {
            facilityId,
            acbsFacilityMasterInput: fmrMapped,
            updateType: 'amendExpiryDate',
            etag: updatedFmr.etag,
          });

          facilityMasterRecordAmendments = {
            ...facilityMasterRecordAmendments,
            updatedFmr,
            coverEndDate,
          };
        }
      }

      return facilityMasterRecordAmendments;
    }

    throw new Error('Invalid argument set provided');
  } catch (error) {
    console.error('Error amending facility master record %o', error);
    throw new Error(`Error amending facility master record ${error}`);
  }
});
