// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ObjectId } = require('mongodb');
import addSeconds from 'date-fns/addSeconds';
import { getCollection } from '../database';
import { Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { eStoreFacilityFolderCreationJob } from './eStoreFacilityFolderCreationJob.cron';
import { createDealFolder } from '../v1/controllers/estore/eStoreApi';

export const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  try {
    const cronJobLogsCollection = await getCollection('cron-job-logs');
    const tfmDealsCollection = await getCollection('tfm-deals');

    // create the Deal folder
    console.info('API Call started: Create the Deal folder for ', eStoreData.dealIdentifier);
    const dealFolderResponse = await createDealFolder(eStoreData.siteName, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
      dealIdentifier: eStoreData.dealIdentifier,
      destinationMarket: eStoreData.destinationMarket,
      riskMarket: eStoreData.riskMarket,
    });
    // check if the API call was successful
    if (dealFolderResponse.status === 201) {
      console.info('API Call finished: The Deal folder was successfully created');
      // stop and the delete the cron job to release the memory
      eStoreCronJobManager.deleteJob(`Deal${eStoreData.dealId}`);

      // update the `tfm-deals` collection once the buyer and deal folders have been created
      tfmDealsCollection.updateOne({ _id: ObjectId(eStoreData.dealId) }, { $set: { 'tfm.estore': { siteName: eStoreData.siteName } } });

      // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
      await cronJobLogsCollection.updateOne(
        { dealId: eStoreData.dealId },
        {
          $set: {
            'dealCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
            'dealCronJob.completionDate': new Date(),
            'facilityCronJob.status': ESTORE_CRON_STATUS.RUNNING,
            'facilityCronJob.startDate': new Date(),
          },
        },
      );

      // check if there are any facilityIds
      if (eStoreData.facilityIdentifiers.length) {
        // add a new job to the `Cron Job Manager` to create the Facility Folders for the current Deal
        const facilityCreationTimer = addSeconds(new Date(), 59);
        eStoreCronJobManager.add(`Facility${eStoreData.dealId}`, facilityCreationTimer, async () => {
          await eStoreFacilityFolderCreationJob(eStoreData);
        });
        console.info('Cron task started: Create the Facility folder');
        eStoreCronJobManager.start(`Facility${eStoreData.dealId}`);
      }
    } else {
      console.error(`API Call failed: Unable to create a Deal Folder for ${eStoreData.dealIdentifier}`, { dealFolderResponse });
      // stop and delete the cron job - this to release the memory
      eStoreCronJobManager.deleteJob(`Deal${eStoreData.dealId}`);
      // update the record inside `cron-job-logs` collection to indicate that the cron job failed
      await cronJobLogsCollection.updateOne(
        { dealId: eStoreData.dealId },
        { $set: { dealFolderResponse, 'dealCronJob.status': ESTORE_CRON_STATUS.FAILED, 'dealCronJob.completionDate': new Date() } },
      );
    }
  } catch (error) {
    console.error('Unable to create the deal folder', { error });
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(`Deal${eStoreData.dealId}`);
  }
};
