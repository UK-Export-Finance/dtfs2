import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { getCollection } from '../database';
import { BuyerFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createBuyerFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

const acceptableStatuses = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * Executes the eStore buyer directory creation job.
 *
 * This job performs the following tasks:
 * 1. Checks if a buyer name is provided in the eStore data.
 * 2. Creates a buyer directory using the provided buyer name and site ID.
 * 3. Updates the cron job logs based on the success or failure of the directory creation.
 *
 * @param {Estore} eStoreData - The eStore data containing information about the deal, exporter, and buyer.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @throws {Error} - Throws an error if there is an issue with database operations or API calls.
 *
 * @example
 * const eStoreData = {
 *   dealIdentifier: '12345',
 *   siteId: '507f1f77bcf86cd799439012',
 *   exporterName: 'Exporter Inc.',
 *   buyerName: 'Buyer Inc.',
 *   dealId: '507f1f77bcf86cd799439011'
 * };
 *
 * eStoreBuyerDirectoryCreationJob(eStoreData)
 *   .then(() => console.log('Job completed successfully'))
 *   .catch((error) => console.error('Job failed', error));
 */
export const eStoreBuyerDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
  const cronJobLogs = await getCollection('cron-job-logs');

  // 1. Creating buyer directory
  if (eStoreData?.buyerName) {
    console.info('Creating buyer directory %s for deal %s', eStoreData.buyerName, eStoreData.dealIdentifier);

    // Create the buyer directory
    const response: BuyerFolderResponse | EstoreErrorResponse = await createBuyerFolder(eStoreData.siteId, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
    });

    // Validate response
    if (acceptableStatuses.includes(response?.status)) {
      console.info('Creating buyer directory %s for deal %s', eStoreData.buyerName, eStoreData.dealIdentifier);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.buyer': {
              status: ESTORE_CRON_STATUS.COMPLETED,
              timestamp: getNowAsEpoch(),
            },
          },
        },
      );

      // Initiate deal directory creation
    } else {
      console.error('eStore buyer directory creation has failed for deal %s %o', eStoreData.dealIdentifier, response);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.buyer': {
              response,
              status: ESTORE_CRON_STATUS.FAILED,
              timestamp: getNowAsEpoch(),
            },
          },
        },
      );
    }
  }
};
