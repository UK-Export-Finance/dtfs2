import { getCollection } from '../database';
import { Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createDealFolder } from '../v1/controllers/estore/eStoreApi';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/src/helpers/changeStream/generateAuditDetails';

/**
 * Performs the following tasks:
 * 1. Adds facilities to the term store for a deal.
 * 2. Creates a buyer directory for a deal.
 *
 * @param eStoreData - The data required for performing the tasks.
 * @returns {Promise<void>} - A promise that resolves once the tasks are completed.
 */
export const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  try {
    const cronJobLogsCollection = await getCollection('cron-job-logs');

    // create the Deal folder
    console.info('API Call started: Create the Deal folder for %s', eStoreData.dealIdentifier);
    const dealFolderResponse = await createDealFolder(eStoreData.siteId, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
      dealIdentifier: eStoreData.dealIdentifier,
      destinationMarket: eStoreData.destinationMarket,
      riskMarket: eStoreData.riskMarket,
    });
    // check if the API call was successful
    if (dealFolderResponse.status === 201) {
      console.info('API Call finished: The Deal folder was successfully created');

      // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
      await cronJobLogsCollection.updateOne(
        { dealId: { $eq: eStoreData.dealId } },
        {
          $set: {
            'dealCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
            'dealCronJob.completionDate': new Date(),
            'facilityCronJob.status': ESTORE_CRON_STATUS.RUNNING,
            'facilityCronJob.startDate': new Date(),
            auditDetails: generateSystemAuditDetails(),
          },
        },
      );

      // check if there are any facilityIds
      if (eStoreData.facilityIdentifiers.length) {
        // Create eStore Facility directories
      }
    } else {
      console.error('API Call failed: Unable to create a Deal Folder %O', dealFolderResponse);
      // update the record inside `cron-job-logs` collection to indicate that the cron job failed
      await cronJobLogsCollection.updateOne(
        { dealId: { $eq: eStoreData.dealId } },
        {
          $set: {
            dealFolderResponse,
            'dealCronJob.status': ESTORE_CRON_STATUS.FAILED,
            'dealCronJob.failureDate': new Date(),
            auditDetails: generateSystemAuditDetails(),
          },
        },
      );
    }
  } catch (error) {
    console.error('Unable to create the deal folder %s', error);
  }
};
