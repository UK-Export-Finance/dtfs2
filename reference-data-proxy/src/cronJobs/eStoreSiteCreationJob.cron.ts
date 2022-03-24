import { getCollection } from '../database';
import { SiteExistsResponse } from '../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { eStoreTermStoreAndBuyerFolder } from './eStoreTermStoreAndBuyerFolder.cron';
import { siteExists } from '../v1/controllers/estore/eStoreApi';

export const eStoreSiteCreationJob = async (eStoreData: any) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  const data = eStoreData;

  console.info('API Call (Cron Job): Checking if the site exists');
  const siteExistsResponse: SiteExistsResponse = await siteExists({ exporterName: eStoreData.exporterName });

  // check if the site has been created
  if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
    console.info('Cron job: eStore Site has been created: ', siteExistsResponse.data.siteName);
    // stop and delete the cron job, to release the memory
    eStoreCronJobManager.deleteJob(siteExistsResponse.data.siteName);
    data.siteName = siteExistsResponse.data.siteName;

    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    await cronJobLogsCollection.updateOne(
      { dealId: eStoreData.dealId },
      {
        $set: {
          siteName: siteExistsResponse.data.siteName,
          'siteCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
          'siteCronJob.completionDate': Date.now(),
          'dealCronJob.status': ESTORE_CRON_STATUS.RUNNING,
          'dealCronJob.startDate': Date.now(),
        },
      },
    );

    // add facilityIds to termStore and create the buyer folder
    eStoreTermStoreAndBuyerFolder(data);
  } else if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING) {
    console.info('Cron job continues: eStore Site Creation Cron Job continues to run');
    // increment the siteCreationRetries by 1
    const response = await cronJobLogsCollection.findOneAndUpdate(
      { dealId: eStoreData.dealId },
      { $inc: { siteCreationRetries: 1 } },
      { returnDocument: 'after' },
    );
    // stop the siteCreation Cron Job after 50 retries
    // this is to prevent it from running forever
    if (response?.value?.siteCreationRetries === 50) {
      // stop and delete the cron job - this to release the memory
      eStoreCronJobManager.deleteJob(siteExistsResponse.data.siteName);
      // update the record inside `cron-job-logs` collection
      await cronJobLogsCollection.updateOne(
        { exporterName: eStoreData.exporterName },
        { $set: { siteExistsResponse, 'siteCronJob.status': ESTORE_CRON_STATUS.FAILED, 'siteCronJob.completionDate': Date.now() } },
      );
    }
  } else {
    console.error(`API Call (Cron Job) failed: Unable to create a new site for ${eStoreData.exporterName}`, siteExistsResponse);
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(siteExistsResponse.data.siteName);
    // update the record inside `cron-job-logs` collection
    await cronJobLogsCollection.updateOne(
      { exporterName: eStoreData.exporterName },
      { $set: { siteExistsResponse, 'siteCronJob.status': ESTORE_CRON_STATUS.FAILED, 'siteCronJob.completionDate': Date.now() } },
    );
  }
};
