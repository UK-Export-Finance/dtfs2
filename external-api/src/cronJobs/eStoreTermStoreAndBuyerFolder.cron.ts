// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ObjectId } = require('mongodb');
import addMinutes from 'date-fns/addMinutes';
import { getCollection } from '../database';
import { TermStoreResponse, BuyerFolderResponse } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { eStoreDealFolderCreationJob } from './eStoreDealFolderCreationJob.cron';
import { createBuyerFolder, addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';

const DEAL_FOLDER_TIMEOUT = 6;

export const eStoreTermStoreAndBuyerFolder = async (eStoreData: any) => {
  if (!ObjectId.isValid(eStoreData.dealId)) {
    throw new Error('Invalid Deal Id');
  }

  const cronJobLogsCollection = await getCollection('cron-job-logs');
  // check if there are any facilityIds
  if (eStoreData.facilityIdentifiers.length) {
    // add facilityIds to TermStore
    console.info('API Call started: Add facilityIds to TermStore');
    // increment the termStoreRetries by 1
    const response = await cronJobLogsCollection.findOneAndUpdate(
      { dealId: { $eq: eStoreData.dealId } },
      { $inc: { termStoreRetries: 1 } },
      { returnNewDocument: true, returnDocument: 'after' },
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
      if (termStoreResponse.every((term) => term?.status === 201 || term.status === 200)) {
        console.info('API Call finished: The facilityIds were added to TermStore successfully');
      } else {
        console.error('API Call failed: Unable to add the facilityIds to TermStore %o', termStoreResponse);
        // update the database to indicate that there was an issue adding the facilityIds to TermStore
        await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: { termStoreResponse } });
      }
    }
  }

  console.info('API Call started: Create the Buyer folder for %o', eStoreData.buyerName);
  // increment the buyerFolderRetries by 1
  const response = await cronJobLogsCollection.findOneAndUpdate(
    { dealId: { $eq: eStoreData.dealId } },
    { $inc: { buyerFolderRetries: 1 } },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  // ensure that there is less than 3 retries for buyer folder creation
  if (response?.value?.buyerFolderRetries <= 3) {
    // create the Buyer folder
    const buyerFolderResponse: BuyerFolderResponse = await createBuyerFolder(eStoreData.siteId, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
    });

    if (buyerFolderResponse?.status === 201) {
      console.info('API Call finished: The Buyer folder for %o was successfully created', eStoreData.buyerName);

      const tfmDealsCollection = await getCollection('tfm-deals');
      // update the `tfm-deals` collection once the buyer folder has been created
      tfmDealsCollection.updateOne({ _id: { $eq: ObjectId(eStoreData.dealId) } }, { $set: { 'tfm.estore.siteName': eStoreData.siteId } });

      const folderCreationTimer = addMinutes(new Date(), DEAL_FOLDER_TIMEOUT);
      eStoreCronJobManager.add(`Deal${eStoreData.dealId}`, folderCreationTimer, () => {
        eStoreDealFolderCreationJob(eStoreData);
      });
      // update the database to indicate that the deal cron job started
      await cronJobLogsCollection.updateOne(
        { dealId: { $eq: eStoreData.dealId } },
        { $set: { 'dealCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'dealCronJob.startDate': new Date() } },
      );

      console.info('Cron job started: eStore Deal folder Cron Job started');
      eStoreCronJobManager.start(`Deal${eStoreData.dealId}`);
    } else {
      console.error('API Call failed: Unable to create the Buyer folder %o', buyerFolderResponse);
      // update the database to indicate that there was an issue creating the buyer Folder
      await cronJobLogsCollection.updateOne({ dealId: { $eq: eStoreData.dealId } }, { $set: { buyerFolderResponse } });
    }
  }
};
