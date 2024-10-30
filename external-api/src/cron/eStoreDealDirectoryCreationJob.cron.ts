import { HttpStatusCode } from 'axios';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { DealFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { cron } from '../helpers/cron';
import { ENDPOINT, ESTORE_CRON_STATUS } from '../constants';
import { createDealFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';
import { eStoreFacilityDirectoryCreationJob } from './eStoreFacilityDirectoryCreationJob.cron';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * The `eStoreDealDirectoryCreationJob` function is responsible for creating a deal directory
 * for a given eStore data object. It validates the input parameters, initiates a CRON job, and
 * attempts to create a deal directory with the provided eStore data.
 *
 * @param {Estore} eStoreData - The eStore data object containing information about the deal, site, exporter, buyer, and markets.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealId: '507f1f77bcf86cd799439011',
 *   siteId: 'site123',
 *   exporterName: 'Exporter Inc.',
 *   buyerName: 'Buyer LLC',
 *   dealIdentifier: 'deal123',
 *   destinationMarket: 'Market A',
 *   riskMarket: 'Market B',
 * };
 *
 * eStoreDealDirectoryCreationJob(eStoreData)
 *   .then(() => console.log('Deal directory creation job completed'))
 *   .catch((error) => console.error('Deal directory creation job failed', error));
 */
export const eStoreDealDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
  try {
    // Argument validation
    const invalidParams =
      !eStoreData?.dealId ||
      !eStoreData?.siteId ||
      !eStoreData?.exporterName ||
      !eStoreData?.buyerName ||
      !eStoreData?.dealIdentifier ||
      !eStoreData?.destinationMarket ||
      !eStoreData?.riskMarket;

    if (invalidParams) {
      console.error('⚠️ Invalid arguments provided for eStore deal directory creation');
      return;
    }

    const { dealId, siteId, exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket } = eStoreData;

    console.info('Attempting to create a deal directory for deal %s', dealIdentifier);

    // Initiate the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.DEAL,
    });

    // Create the deal directory
    const response: DealFolderResponse | EstoreErrorResponse = await createDealFolder(siteId, {
      exporterName,
      buyerName,
      dealIdentifier,
      destinationMarket,
      riskMarket,
    });

    const dealDirectoryCreated = ACCEPTABLE_STATUSES.includes(response?.status);

    // Buyer directory creation still in progress
    const dealDirectoryPending = response?.status === Number(HttpStatusCode.BadRequest);

    // Validate response
    if (dealDirectoryCreated) {
      console.info('✅ eStore deal directory %s has been created for deal %s', dealIdentifier, dealIdentifier);

      // Update `cron-job-logs`
      await EstoreRepo.updateByDealId(dealId, {
        'cron.deal': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          timestamp: getNowAsEpoch(),
        },
      });

      // Stop the CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.DEAL,
        kill: true,
      });

      // Initiate facility directory creation
      await eStoreFacilityDirectoryCreationJob(eStoreData);
    } else if (dealDirectoryPending) {
      console.info('⚡ eStore deal directory %s creation is still in progress for deal %s', dealIdentifier, dealIdentifier);

      // Update status
      await EstoreRepo.updateByDealId(dealId, {
        'cron.deal': {
          status: ESTORE_CRON_STATUS.RUNNING,
          timestamp: getNowAsEpoch(),
        },
      });
    } else {
      throw new Error(`eStore deal directory creation has failed for deal ${dealIdentifier} ${JSON.stringify(response)}`);
    }
  } catch (error) {
    // Update `cron-job-logs`
    await EstoreRepo.updateByDealId(eStoreData?.dealId, {
      'cron.deal': {
        error: String(error),
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Stop the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.DEAL,
      kill: true,
    });

    console.error('❌ eStore deal directory creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
