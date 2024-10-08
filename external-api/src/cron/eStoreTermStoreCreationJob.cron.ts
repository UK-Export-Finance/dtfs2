import { HttpStatusCode } from 'axios';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { TermStoreResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { cron } from '../helpers/cron';
import { ENDPOINT, ESTORE_CRON_STATUS } from '../constants';
import { addFacilityToTermStore } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';
import { eStoreBuyerDirectoryCreationJob } from './eStoreBuyerDirectoryCreationJob.cron';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * The `eStoreTermStoreCreationJob` function is responsible for adding facilities to the term store
 * for a given eStore data object. It validates the input parameters, initiates a CRON job, and
 * attempts to add each facility to the term store.
 *
 * @param {Estore} eStoreData - The eStore data object containing information about the deal and facilities.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealId: '507f1f77bcf86cd799439011',
 *   facilityIdentifiers: [1, 2, 3],
 *   dealIdentifier: 'deal123',
 * };
 *
 * eStoreTermStoreCreationJob(eStoreData)
 *   .then(() => console.log('Term store creation job completed'))
 *   .catch((error) => console.error('Term store creation job failed', error));
 */
export const eStoreTermStoreCreationJob = async (eStoreData: Estore): Promise<void> => {
  try {
    const invalidParams = !eStoreData?.dealId || !eStoreData?.facilityIdentifiers || !eStoreData.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('⚠️ Invalid arguments provided for eStore facility term store creation');
      return;
    }

    // Facilities existence check for addition to term store
    if (eStoreData?.facilityIdentifiers?.length) {
      const { dealId, facilityIdentifiers, dealIdentifier } = eStoreData;

      console.info('Adding facilities to term store for deal %s', dealIdentifier);

      // Initiate the CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.TERM,
      });

      // Add to term store
      const response: TermStoreResponse[] | EstoreErrorResponse[] = await Promise.all(
        facilityIdentifiers.map((facilityId: number) => addFacilityToTermStore({ id: facilityId })),
      );

      // Validate each and every response status code
      const allTermStoresCreated = response.every((term) => ACCEPTABLE_STATUSES.includes(term?.status));

      if (allTermStoresCreated) {
        console.info('✅ Facilities have been added to term store for deal %s', dealIdentifier);

        // Update `cron-job-logs`
        await EstoreRepo.updateByDealId(dealId, {
          'cron.term': {
            status: ESTORE_CRON_STATUS.COMPLETED,
            timestamp: getNowAsEpoch(),
          },
        });

        // Stop the CRON job
        cron({
          data: eStoreData,
          category: ENDPOINT.TERM,
          kill: true,
        });

        // Initiate buyer directory creation
        await eStoreBuyerDirectoryCreationJob(eStoreData);
      } else {
        throw new Error(`Facilities have not been added to term store for deal ${dealIdentifier} ${JSON.stringify(response)}`);
      }
    }
  } catch (error) {
    // Update `cron-job-logs`
    await EstoreRepo.updateByDealId(eStoreData?.dealId, {
      'cron.term': {
        error: String(error),
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Stop the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.TERM,
      kill: true,
    });

    console.error('❌ eStore term store creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
