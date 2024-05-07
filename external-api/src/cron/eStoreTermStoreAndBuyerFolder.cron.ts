import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { getCollection } from '../database';
import { TermStoreResponse, BuyerFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createBuyerFolder, addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

const acceptableStatuses = [HttpStatusCode.Ok, HttpStatusCode.Created];

export const eStoreTermStoreAndBuyerFolder = async (eStoreData: Estore) => {
  const cronJobLogs = await getCollection('cron-job-logs');

  // 1. Facilities existence check for addition to term store
  if (eStoreData?.facilityIdentifiers?.length) {
    console.info('Adding facilities to term store for deal %s', eStoreData.dealIdentifier);

    const responses: TermStoreResponse[] | EstoreErrorResponse[] = await Promise.all(
      eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id.toString() })),
    );

    if (responses.every((term) => acceptableStatuses.includes(term?.status))) {
      console.info('Facilities have been added to term store for deal %s', eStoreData.dealIdentifier);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.term': {
              status: ESTORE_CRON_STATUS.COMPLETED,
              timestamp: getNowAsEpoch(),
            },
          },
        },
      );
    } else {
      console.error(
        'Facilities have not been added to term store for deal %s %o',
        eStoreData.dealIdentifier,
        responses,
      );

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.term': {
              status: ESTORE_CRON_STATUS.FAILED,
              timestamp: getNowAsEpoch(),
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

    if (acceptableStatuses.includes(response?.status)) {
      console.info('Creating buyer directory %s for deal %s', eStoreData.buyerName, eStoreData.dealIdentifier);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.buyer': {
              status: ESTORE_CRON_STATUS.COMPLETED,
              timestamp: getNowAsEpoch(),
            },
          },
        },
      );
    } else {
      console.error('eStore buyer directory creation has failed for deal %s %o', eStoreData.dealIdentifier, response);

      // Update `cron-job-logs`
      await cronJobLogs.updateOne(
        { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
        {
          $set: {
            'cron.buyer': {
              status: ESTORE_CRON_STATUS.FAILED,
              timestamp: getNowAsEpoch(),
            },
          },
        },
      );
    }
  }
};
