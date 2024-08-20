import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { getCollection } from '../database';
import { DealFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createDealFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';
import { eStoreFacilityDirectoryCreationJob } from './eStoreFacilityDirectoryCreationJob.cron';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * Executes the eStore deal directory creation job.
 *
 * This job performs the following tasks:
 * 1. Checks if an exporter name is provided in the eStore data.
 * 2. Creates a deal directory using the provided exporter name and other deal details.
 * 3. Updates the cron job logs based on the success or failure of the directory creation.
 * 4. Initiates the facility directory creation job if the deal directory creation is successful.
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
 *   dealId: '507f1f77bcf86cd799439011',
 *   destinationMarket: 'UK',
 *   riskMarket: 'High'
 * };
 *
 * eStoreDealDirectoryCreationJob(eStoreData)
 *   .then(() => console.log('Job completed successfully'))
 *   .catch((error) => console.error('Job failed', error));
 */
export const eStoreDealDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
  const cronJobLogs = await getCollection('cron-job-logs');

  // 1. Creating deal directory
  if (eStoreData?.exporterName) {
    const { dealId, siteId, exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket } = eStoreData;

    console.info('Attempting to create a deal directory for deal %s', dealIdentifier);

    // Create the deal directory
    const response: DealFolderResponse | EstoreErrorResponse = await createDealFolder(siteId, {
      exporterName,
      buyerName,
      dealIdentifier,
      destinationMarket,
      riskMarket,
    });

    // Validate response
    if (ACCEPTABLE_STATUSES.includes(response?.status)) {
      console.info('Attempting to create a deal directory for deal %s', dealIdentifier);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.deal': {
              status: ESTORE_CRON_STATUS.COMPLETED,
              timestamp: getNowAsEpoch(),
            },
          },
        },
      );

      // Initiate facility directory creation
      await eStoreFacilityDirectoryCreationJob(eStoreData);
    } else {
      console.error('eStore deal directory creation has failed for deal %s %o', dealIdentifier, response);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(dealId) } },
        {
          $set: {
            'cron.deal': {
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
