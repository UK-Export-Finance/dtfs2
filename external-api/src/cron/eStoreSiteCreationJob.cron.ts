import { cloneDeep } from 'lodash';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { cron } from '../helpers/cron';
import { Estore, EstoreErrorResponse, SiteExistsResponse } from '../interfaces';
import { ENDPOINT, ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../constants';
import { eStoreTermStoreCreationJob } from './eStoreTermStoreCreationJob.cron';
import { siteExists } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

/**
 * Executes the eStore site creation cron job.
 *
 * This job performs the following tasks:
 * 1. Initiates the CRON job for site creation.
 * 2. Checks if the site already exists for the provided exporter name.
 * 3. If the site has been created, updates the cron job logs and TFM deals collections, and stops the CRON job.
 * 4. If the site is in provisioning status, it will handle accordingly (not shown in the excerpt).
 * 5. Adds facility IDs to the term store and creates the buyer folder if the site creation is successful.
 *
 * @param {Estore} eStoreData - The eStore data containing information about the deal, exporter, and other relevant details.
 *
 * @returns {Promise<void>} - A promise that resolves when the cron job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealIdentifier: '12345',
 *   exporterName: 'Exporter Inc.',
 *   dealId: '507f1f77bcf86cd799439011'
 * };
 *
 * eStoreSiteCreationCron(eStoreData)
 *   .then(() => console.log('Cron job completed successfully'))
 *   .catch((error) => console.error('Cron job failed', error));
 */
export const eStoreSiteCreationCron = async (eStoreData: Estore): Promise<void> => {
  try {
    const data = cloneDeep(eStoreData);
    const now = new Date().toISOString();

    const invalidParams = !eStoreData?.dealId || !eStoreData?.exporterName || !eStoreData.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('Invalid arguments provided for eStore site creation');
      return;
    }

    const { dealId, exporterName, dealIdentifier } = eStoreData;

    // Step 1: Initiate the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.SITE,
    });

    // Step 2: Site existence check
    const siteExistsResponse: SiteExistsResponse | EstoreErrorResponse = await siteExists(exporterName);

    // Step 3: Site has been created
    if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
      console.info('⚡ CRON: eStore site %s has been created successfully for deal %s %s', siteExistsResponse.data.siteId, dealIdentifier, now);

      data.siteId = String(siteExistsResponse.data.siteId);

      // Update `cron-job-logs`
      await EstoreRepo.updateByDealId(dealId, {
        'cron.site.create': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          response: siteExistsResponse.data.status,
          timestamp: getNowAsEpoch(),
          id: siteExistsResponse.data.siteId,
        },
        'cron.site.status': ESTORE_CRON_STATUS.COMPLETED,
      });

      // Update `tfm-deals`
      await EstoreRepo.updateTfmDealByDealId(dealId, {
        'tfm.estore.siteName': siteExistsResponse.data.siteId,
      });

      // Stop CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.SITE,
        kill: true,
      });

      // Add facility IDs to term store and create the buyer folder
      await eStoreTermStoreCreationJob(data);
    } else if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING) {
      // Step 3: Site is still being provisioned
      console.info('⚡ CRON: eStore site creation %s is still in progress for deal %s %s', siteExistsResponse.data.siteId, dealIdentifier, now);

      // Update status
      await EstoreRepo.updateByDealId(dealId, {
        'cron.site.create': {
          response: siteExistsResponse.data.status,
          status: ESTORE_CRON_STATUS.RUNNING,
          timestamp: getNowAsEpoch(),
        },
        'cron.site.status': ESTORE_CRON_STATUS.RUNNING,
        'cron.site.id': siteExistsResponse?.data?.siteId,
      });
    } else {
      // Step 3: Site creation has failed

      // Stop CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.SITE,
        kill: true,
      });

      throw new Error(`eStore site creation has failed for deal ${dealIdentifier} ${JSON.stringify(siteExistsResponse)}`);
    }
  } catch (error) {
    // CRON job log update
    await EstoreRepo.updateByDealId(eStoreData?.dealId, {
      'cron.site.create': {
        error: String(error),
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
      'cron.site.status': ESTORE_CRON_STATUS.FAILED,
    });

    console.error('❌ eStore site creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
