import { HttpStatusCode } from 'axios';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { BuyerFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { cron } from '../helpers/cron';
import { ENDPOINT, ESTORE_CRON_STATUS } from '../constants';
import { createBuyerFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';
import { eStoreDealDirectoryCreationJob } from './eStoreDealDirectoryCreationJob.cron';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

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
  try {
    const invalidParams = !eStoreData.dealId || !eStoreData?.siteId || !eStoreData?.buyerName || !eStoreData.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('Invalid arguments provided for eStore buyer directory creation');
      return;
    }

    const { dealId, siteId, buyerName, dealIdentifier } = eStoreData;

    console.info('Attempting to create a buyer directory %s for deal %s', buyerName, dealIdentifier);

    // Initiate the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.BUYER,
    });

    // Create the buyer directory
    const response: BuyerFolderResponse | EstoreErrorResponse = await createBuyerFolder(siteId, {
      buyerName,
    });

    // Validate response
    if (ACCEPTABLE_STATUSES.includes(response?.status)) {
      console.info('Attempting to create a buyer directory %s for deal %s', buyerName, dealIdentifier);

      // Update `cron-job-logs`
      await EstoreRepo.updateByDealId(dealId, {
        'cron.buyer': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          timestamp: getNowAsEpoch(),
        },
      });

      // Stop the CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.BUYER,
        kill: true,
      });

      // Initiate deal directory creation
      await eStoreDealDirectoryCreationJob(eStoreData);
    } else {
      throw new Error(`eStore buyer directory creation has failed for deal ${dealIdentifier} ${JSON.stringify(response)}`);
    }
  } catch (error) {
    // Update `cron-job-logs`
    await EstoreRepo.updateByDealId(eStoreData?.dealId, {
      'cron.buyer': {
        error: String(error),
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Stop the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.BUYER,
      kill: true,
    });

    console.error('❌ eStore buyer directory creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
