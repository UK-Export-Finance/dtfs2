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
 * The `eStoreBuyerDirectoryCreationJob` function is responsible for creating a buyer directory
 * for a given eStore data object. It validates the input parameters, initiates a CRON job, and
 * attempts to create a buyer directory with the provided eStore data.
 *
 * @param {Estore} eStoreData - The eStore data object containing information about the deal, site, and buyer.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealId: '507f1f77bcf86cd799439011',
 *   siteId: 'site123',
 *   buyerName: 'Buyer LLC',
 *   dealIdentifier: 'deal123',
 * };
 *
 * eStoreBuyerDirectoryCreationJob(eStoreData)
 *   .then(() => console.log('Buyer directory creation job completed'))
 *   .catch((error) => console.error('Buyer directory creation job failed', error));
 */
export const eStoreBuyerDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
  try {
    const invalidParams = !eStoreData.dealId || !eStoreData?.siteId || !eStoreData?.buyerName || !eStoreData.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('⚠️ Invalid arguments provided for eStore buyer directory creation');
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

    const buyerDirectoryCreated = ACCEPTABLE_STATUSES.includes(response?.status);

    // Validate response
    if (buyerDirectoryCreated) {
      console.info('✅ Buyer directory %s has been created for deal %s', buyerName, dealIdentifier);

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
