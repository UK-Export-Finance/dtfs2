import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { updateByDealId } from '../repositories/estore/estore-repo';
import { FacilityFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createFacilityFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * Executes the eStore facility directory creation job.
 *
 * This job performs the following tasks:
 * 1. Checks if facility identifiers are provided in the eStore data.
 * 2. Creates facility directories using the provided facility identifiers as an array and other deal details.
 * 3. Updates the cron job logs based on the success or failure of the directory creation.
 * 4. Initiates the document upload process if the facility directory creation is successful.
 *
 * @param {Estore} eStoreData - The eStore data containing information about the deal, exporter, buyer, and facilities.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealIdentifier: '12345',
 *   siteId: '507f1f77bcf86cd799439012',
 *   exporterName: 'Exporter Inc.',
 *   buyerName: 'Buyer Inc.',
 *   dealId: '507f1f77bcf86cd799439011',
 *   facilityIdentifiers: ['FAC123', 'FAC456']
 * };
 *
 * eStoreFacilityDirectoryCreationJob(eStoreData)
 *   .then(() => console.log('Job completed successfully'))
 *   .catch((error) => console.error('Job failed', error));
 */
export const eStoreFacilityDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
  // Argument validation
  if (
    !eStoreData?.dealId ||
    !eStoreData?.siteId ||
    !eStoreData?.facilityIdentifiers ||
    !eStoreData?.exporterName ||
    !eStoreData?.buyerName ||
    !eStoreData?.dealIdentifier
  ) {
    console.error('Invalid arguments provided for eStore facility directory creation');
    return;
  }

  const { dealId, siteId, facilityIdentifiers, exporterName, buyerName, dealIdentifier } = eStoreData;

  console.info('Attempting to create a facility directory %s for deal %s', facilityIdentifiers, dealIdentifier);

  // Step 1: Create the facility directory
  const response: FacilityFolderResponse[] | EstoreErrorResponse[] = await Promise.all(
    facilityIdentifiers.map((facilityIdentifier: number) =>
      createFacilityFolder(siteId, dealIdentifier, {
        facilityIdentifier,
        buyerName,
        exporterName,
      }),
    ),
  );

  // Validate each and every response status code
  if (response.every((facility) => ACCEPTABLE_STATUSES.includes(facility?.status))) {
    console.info('Facility %s directory has been created for deal %s', facilityIdentifiers, dealIdentifier);

    // Step 2: Update `cron-job-logs`
    await updateByDealId(new ObjectId(dealId), {
      'cron.facility': {
        status: ESTORE_CRON_STATUS.COMPLETED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Step 3: Initiate document upload
  } else {
    console.error('eStore facility directory creation has failed for deal %s %o', dealIdentifier, response);

    // Update `cron-job-logs`
    await updateByDealId(new ObjectId(dealId), {
      'cron.facility': {
        response,
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });
  }
};