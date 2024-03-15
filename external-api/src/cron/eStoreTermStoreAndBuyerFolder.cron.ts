import { ObjectId } from 'mongodb';
import { getCollection } from '../database';
import { TermStoreResponse, BuyerFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createBuyerFolder, addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';
import { HttpStatusCode } from 'axios';

const acceptableStatus = [HttpStatusCode.Ok, HttpStatusCode.Created];

export const eStoreTermStoreAndBuyerFolder = async (eStoreData: Estore) => {
  const cronJobLogs = await getCollection('cron-job-logs');

  // 1. Facilities existence check for addition to term store
  if (eStoreData?.facilityIdentifiers?.length) {
    console.info('Adding facilities to term store for deal %s', eStoreData.dealIdentifier);

    const response: TermStoreResponse[] | EstoreErrorResponse[] = await Promise.all(
      eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id.toString() })),
    );

    if (response.every((term) => acceptableStatus.includes(term?.status))) {
      console.info('Facilities have been added to term store for deal %s', eStoreData.dealIdentifier);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.term': {
              status: ESTORE_CRON_STATUS.COMPLETED,
              timestamp: new Date().valueOf(),
            },
          },
        },
      );
    } else {
      console.error('Facilities have not been added to term store for deal %s %s', eStoreData.dealIdentifier, response);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.term': {
              status: ESTORE_CRON_STATUS.FAILED,
              timestamp: new Date().valueOf(),
            },
          },
        },
      );
    }
  }

  // 2. Creating buyer directory
  if (eStoreData?.buyerName) {
    console.info('Creating buyer directory %s for deal %s', eStoreData.buyerName, eStoreData.dealIdentifier);

    // Create the buyer directory
    const response: BuyerFolderResponse | EstoreErrorResponse = await createBuyerFolder(eStoreData.siteId, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
    });

    if (acceptableStatus.includes(response?.status)) {
      console.info('Creating buyer directory %s for deal %s', eStoreData.buyerName, eStoreData.dealIdentifier);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.buyer': {
              status: ESTORE_CRON_STATUS.COMPLETED,
              timestamp: new Date().valueOf(),
            },
          },
        },
      );
    } else {
      console.error('eStore buyer directory creation has failed for deal %s %s', eStoreData.dealIdentifier, response);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.buyer': {
              status: ESTORE_CRON_STATUS.FAILED,
              timestamp: new Date().valueOf(),
            },
          },
        },
      );
    }
  }
};
