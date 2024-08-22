import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { updateByDealId } from '../repositories/estore/estore-repo';
import { TermStoreResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';
import { eStoreBuyerDirectoryCreationJob } from './eStoreBuyerDirectoryCreationJob.cron';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * Executes the eStore term store creation job.
 *
 * This job performs the following tasks:
 * 1. Checks for the existence of facilities in the provided eStore data
 * 2. Attempts to add them to the term store for the provided facilities.
 *
 * @param {Estore} eStoreData - The eStore data containing information about the deal, facilities, and buyer.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealIdentifier: '12345',
 *   facilityIdentifiers: [1, 2, 3],
 *   buyerName: 'Buyer Inc.',
 *   dealId: '507f1f77bcf86cd799439011'
 * };
 *
 * eStoreTermStoreCreationJob(eStoreData)
 *   .then(() => console.log('Job completed successfully'))
 *   .catch((error) => console.error('Job failed', error));
 */
export const eStoreTermStoreCreationJob = async (eStoreData: Estore): Promise<void> => {
  // Argument validation
  if (!eStoreData?.dealId || !eStoreData?.facilityIdentifiers || !eStoreData.dealIdentifier) {
    console.error('Invalid arguments provided for eStore facility term store creation');
    return;
  }

  // Facilities existence check for addition to term store
  if (eStoreData?.facilityIdentifiers?.length) {
    const { dealId, facilityIdentifiers, dealIdentifier } = eStoreData;

    console.info('Adding facilities to term store for deal %s', dealIdentifier);

    // Step 1: Add to term store
    const response: TermStoreResponse[] | EstoreErrorResponse[] = await Promise.all(
      facilityIdentifiers.map((facilityId: number) => addFacilityToTermStore({ facilityId })),
    );

    // Validate each and every response status code
    if (response.every((term) => ACCEPTABLE_STATUSES.includes(term?.status))) {
      console.info('Facilities have been added to term store for deal %s', dealIdentifier);

      // Step 2: Update `cron-job-logs`
      await updateByDealId(new ObjectId(dealId), {
        $set: {
          'cron.term': {
            status: ESTORE_CRON_STATUS.COMPLETED,
            timestamp: getNowAsEpoch(),
          },
        },
      });

      // Step 3: Initiate buyer directory creation
      await eStoreBuyerDirectoryCreationJob(eStoreData);
    } else {
      console.error('Facilities have not been added to term store for deal %s %o', dealIdentifier, response);

      // Update `cron-job-logs`
      await updateByDealId(new ObjectId(dealId), {
        'cron.term': {
          response,
          status: ESTORE_CRON_STATUS.FAILED,
          timestamp: getNowAsEpoch(),
        },
      });
    }
  }
};
