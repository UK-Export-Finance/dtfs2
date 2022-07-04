import addSeconds from 'date-fns/addSeconds';
import { getCollection } from '../database';
import { TermStoreResponse, BuyerFolderResponse } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { eStoreDealFolderCreationJob } from './eStoreDealFolderCreationJob.cron';
import { createBuyerFolder, addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';

export const eStoreTermStoreAndBuyerFolder = async (eStoreData: any) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  // check if there are any facilityIds
  if (eStoreData.facilityIdentifiers.length) {
    // add facilityIds to TermStore
    console.info('API Call started: Add facilityIds to TermStore');
    // increment the termStoreRetries by 1
    const response = await cronJobLogsCollection.findOneAndUpdate(
      { dealId: eStoreData.dealId },
      { $inc: { termStoreRetries: 1 } },
      { returnDocument: 'after' },
    );

    // ensure that there is only 1 retry for term store creation
    // this is to prevent it from running forever
    if (response?.value?.termStoreRetries === 1) {
      const termStoreResponse: TermStoreResponse[] = await Promise.all(
        eStoreData.facilityIdentifiers.map((id: number) => {
          if (id) {
            return addFacilityToTermStore({ id: id.toString() });
          }
          return id;
        }),
      );
      if (termStoreResponse.every((term) => term?.status === 201)) {
        console.info('API Call finished: The facilityIds were added to TermStore successfully');
      } else {
        console.error('API Call failed: Unable to add the facilityIds to TermStore', { termStoreResponse });
        // update the database to indicate that there was an issue adding the facilityIds to TermStore
        await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { termStoreResponse } });
      }
    }
  }

  console.info('API Call started: Create the Buyer folder for ', eStoreData.buyerName);
  // increment the buyerFolderRetries by 1
  const response = await cronJobLogsCollection.findOneAndUpdate(
    { dealId: eStoreData.dealId },
    { $inc: { buyerFolderRetries: 1 } },
    { returnDocument: 'after' },
  );

  // ensure that there is only 1 retry for buyer folder creation
  if (response?.value?.buyerFolderRetries === 1) {
    // create the Buyer folder
    const buyerFolderResponse: BuyerFolderResponse = await createBuyerFolder(eStoreData.siteName, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
    });

    if (buyerFolderResponse?.status === 201) {
      console.info(`API Call finished: The Buyer folder for ${eStoreData.buyerName} was successfully created`);
      const folderCreationTimer = addSeconds(new Date(), 59);

      // add a new job to the `Cron Job manager` queue that executes after 59 seconds
      eStoreCronJobManager.add(`Deal${eStoreData.dealId}`, folderCreationTimer, async () => {
        await eStoreDealFolderCreationJob(eStoreData);
      });
      // update the database to indicate that the deal cron job started
      await cronJobLogsCollection.updateOne(
        { dealId: eStoreData.dealId },
        { $set: { 'dealCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'dealCronJob.startDate': new Date() } },
      );
      console.info('Cron job started: eStore Deal folder Cron Job started');
      eStoreCronJobManager.start(`Deal${eStoreData.dealId}`);
    } else {
      console.error(`API Call failed: Unable to create the buyer folder for ${eStoreData.buyerName}`, buyerFolderResponse);
      // update the database to indicate that there was an issue creating the buyer Folder
      await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { buyerFolderResponse } });
    }
  }
};
