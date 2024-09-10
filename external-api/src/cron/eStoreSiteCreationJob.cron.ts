import { cloneDeep } from 'lodash';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { cron } from '../helpers/cron';
import { Estore, EstoreErrorResponse, SiteExistsResponse } from '../interfaces';
import { ENDPOINT, ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../constants';
import { eStoreTermStoreCreationJob } from './eStoreTermStoreCreationJob.cron';
import { siteExists } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

/**
 * The `eStoreSiteCreationCronJob` function is responsible for creating a site for a given eStore data object.
 * It validates the input parameters, initiates a CRON job, checks if the site already exists, and updates the
 * relevant records in the database.
 *
 * @param {Estore} eStoreData - The eStore data object containing information about the deal, exporter, and site.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealId: '507f1f77bcf86cd799439011',
 *   exporterName: 'Exporter Inc.',
 *   dealIdentifier: 'deal123',
 * };
 *
 * eStoreSiteCreationCronJob(eStoreData)
 *   .then(() => console.log('Site creation job completed'))
 *   .catch((error) => console.error('Site creation job failed', error));
 */
export const eStoreSiteCreationCronJob = async (eStoreData: Estore): Promise<void> => {
  try {
    const data = cloneDeep(eStoreData);

    const invalidParams = !eStoreData?.dealId || !eStoreData?.exporterName || !eStoreData.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('⚠️ Invalid arguments provided for eStore site creation');
      return;
    }

    const { dealId, exporterName, dealIdentifier } = eStoreData;

    // Initiate the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.SITE,
    });

    // Site existence check
    const siteExistsResponse: SiteExistsResponse | EstoreErrorResponse = await siteExists(exporterName);

    const siteCreated = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED;
    const sitePending = siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING;

    // Site has been created
    if (siteCreated) {
      console.info('✅ eStore site %s has been created successfully for deal %s', siteExistsResponse.data.siteId, dealIdentifier);

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

      // Stop the CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.SITE,
        kill: true,
      });

      // Add facility IDs to term store and create the buyer folder
      await eStoreTermStoreCreationJob(data);
    } else if (sitePending) {
      // Site is still being provisioned
      console.info('⚡ eStore site creation %s is still in progress for deal %s', siteExistsResponse.data.siteId, dealIdentifier);

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
      // Site creation has failed
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

    // Stop the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.SITE,
      kill: true,
    });

    console.error('❌ eStore site creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
