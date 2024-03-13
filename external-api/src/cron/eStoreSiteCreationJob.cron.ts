import { ObjectId } from 'mongodb';
import { getCollection } from '../database';
import { EstoreErrorResponse, SiteExistsResponse } from '../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { eStoreTermStoreAndBuyerFolder } from './eStoreTermStoreAndBuyerFolder.cron';
import { siteExists } from '../v1/controllers/estore/eStoreApi';

/**
 * Creates a new eStore site based on the provided eStoreData.
 * @param {any} eStoreData - An object containing the necessary data for creating the eStore site.
 * @returns {Promise<void>} - None
 */
export const eStoreSiteCreationCron = async (eStoreData: any) => {
  const cronJobLogs = await getCollection('cron-job-logs');
  const tfmDeals = await getCollection('tfm-deals');
  const cron = `estore_cron_site_${eStoreData.dealId}`;
  const data = eStoreData;

  // Step 1: Site exists check
  console.info('CRON - eStore site exist check for deal %s', eStoreData.dealIdentifier);
  const siteExistsResponse: SiteExistsResponse | EstoreErrorResponse = await siteExists(eStoreData.exporterName);

  // Step 2: Site already exists in eStore
  if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
    console.info('CRON - eStore site %s exist check successful for deal %s', siteExistsResponse.data.siteId, eStoreData.dealIdentifier);

    // Stop CRON job
    eStoreCronJobManager.deleteJob(cron);
    data.siteId = siteExistsResponse.data.siteId;

    // Update `cron-job-logs`
    await cronJobLogs.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      {
        $set: {
          'cron.site': {
            status: ESTORE_CRON_STATUS.COMPLETED,
            timestamp: new Date().valueOf(),
            id: siteExistsResponse.data.siteId,
          },
        },
      },
    );

    // Update `tfm-deals`
    await tfmDeals.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } },
    );

    // Add facility IDs to term store and create the buyer folder
    eStoreTermStoreAndBuyerFolder(data);
  } else if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING) {
    console.info('CRON - eStore site creation in progress for deal %s', eStoreData.dealIdentifier);

    // Increment site creation by `1`
    await cronJobLogs.findOneAndUpdate(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      { $inc: { 'cron.site.create.execution': 1 } },
      { returnNewDocument: true, returnDocument: 'after' },
    );
  } else {
    console.error('CRON - eStore site existence check failed for deal %s %O', eStoreData.dealIdentifier, siteExistsResponse);

    // Stop CRON job
    eStoreCronJobManager.deleteJob(cron);

    // CRON job log update
    await cronJobLogs.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      {
        $set: {
          'cron.site.create': {
            response: siteExistsResponse.data,
            status: ESTORE_CRON_STATUS.FAILED,
            timestamp: new Date().valueOf(),
          },
        },
      },
    );
  }
};
