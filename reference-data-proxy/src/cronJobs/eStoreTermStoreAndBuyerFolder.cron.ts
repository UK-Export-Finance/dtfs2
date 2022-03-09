import { getCollection } from '../database';
import { TermStoreResponse, BuyerFolderResponse } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { eStoreDealFolderCreationJob } from './eStoreDealFolderCreationJob.cron';
import { createBuyerFolder, addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';

const folderCreationTimer = '30 * * * * *';

export const eStoreTermStoreAndBuyerFolder = async (eStoreData: any) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  // check if there are any facilityIds
  if (eStoreData.facilityIdentifiers.length) {
    // add facilityIds to TermStore
    console.info('API Call started: Add facilityIds to TermStore');
    const termStoreResponse: TermStoreResponse[] = await Promise.all(
      eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id.toString() })),
    );
    if (termStoreResponse.every((term) => term.status === 201)) {
      console.info('API Call finished: The facilityIds were added to TermStore successfully');
    } else {
      console.error('API Call failed: Unable to add the facilityIds to TermStore', { termStoreResponse });
      // update the database to indicate that there was an issue adding the facilityIds to TermStore
      await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { termStoreResponse } });
    }
  }

  console.info('API Call started: Create the Buyer folder for ', eStoreData.buyerName);
  // create the Buyer folder
  const buyerFolderResponse: BuyerFolderResponse = await createBuyerFolder(eStoreData.siteName, {
    exporterName: eStoreData.exporterName,
    buyerName: eStoreData.buyerName,
  });

  if (buyerFolderResponse.status === 201) {
    console.info(`API Call finished: The Buyer folder for ${eStoreData.buyerName} was successfully created`);
    // add a new job to the `Cron Job manager` queue that runes every 35 seconds
    // in general, the folder creation should take between 20 to 30 seconds
    eStoreCronJobManager.add(`Deal${eStoreData.dealId}`, folderCreationTimer, async () => {
      await eStoreDealFolderCreationJob(eStoreData);
    });
    // update the database to indicate that the deal cron job started
    await cronJobLogsCollection.updateOne(
      { dealId: eStoreData.dealId },
      { $set: { 'dealCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'dealCronJob.startDate': Date.now() } },
    );
    console.info('Cron job started: eStore Deal folder Cron Job started');
    eStoreCronJobManager.start(`Deal${eStoreData.dealId}`);
  } else {
    console.error(`API Call failed: Unable to create the buyer folder for ${eStoreData.buyerName}`, buyerFolderResponse);
    // update the database to indicate that there was an issue creating the buyer Folder
    await cronJobLogsCollection.updateOne({ dealId: eStoreData.dealId }, { $set: { buyerFolderResponse } });
  }
};
