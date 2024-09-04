import { HttpStatusCode } from 'axios';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { BuyerFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
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
  const invalidParams = !eStoreData.dealId || !eStoreData?.siteId || !eStoreData?.exporterName || !eStoreData?.buyerName || !eStoreData.dealIdentifier;

  // Argument validation
  if (invalidParams) {
    console.error('Invalid arguments provided for eStore buyer directory creation');
    return;
  }

  const { dealId, siteId, exporterName, buyerName, dealIdentifier } = eStoreData;

  console.info('Attempting to create a buyer directory %s for deal %s', buyerName, dealIdentifier);

  // Step 1: Create the buyer directory
  const response: BuyerFolderResponse | EstoreErrorResponse = await createBuyerFolder(siteId, {
    exporterName,
    buyerName,
  });

  // Validate response
  if (ACCEPTABLE_STATUSES.includes(response?.status)) {
    console.info('Attempting to create a buyer directory %s for deal %s', buyerName, dealIdentifier);

    // Step 2: Update `cron-job-logs`
    await EstoreRepo.updateByDealId(dealId, {
      'cron.buyer': {
        status: ESTORE_CRON_STATUS.COMPLETED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Step 3: Initiate deal directory creation
    await eStoreDealDirectoryCreationJob(eStoreData);
  } else {
    console.error('eStore buyer directory creation has failed for deal %s %o', dealIdentifier, response);

    // Update `cron-job-logs`
    await EstoreRepo.updateByDealId(dealId, {
      'cron.buyer': {
        response,
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });
  }
};
