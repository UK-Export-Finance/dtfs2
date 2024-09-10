import { HttpStatusCode } from 'axios';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { FacilityFolderResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { cron } from '../helpers/cron';
import { ENDPOINT, ESTORE_CRON_STATUS } from '../constants';
import { createFacilityFolder } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';
import { eStoreDocumentsCreationJob } from './eStoreDocumentsCreationJob.cron';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * The `eStoreFacilityDirectoryCreationJob` function is responsible for creating facility directories
 * for a given eStore data object. It validates the input parameters, initiates a CRON job, and
 * attempts to create facility directories for each facility identifier provided in the eStore data.
 *
 * @param {Estore} eStoreData - The eStore data object containing information about the deal, site, and facilities.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealId: '507f1f77bcf86cd799439011',
 *   siteId: 'site123',
 *   facilityIdentifiers: [1, 2, 3],
 *   exporterName: 'Exporter Inc.',
 *   buyerName: 'Buyer LLC',
 *   dealIdentifier: 'deal123',
 * };
 *
 * eStoreFacilityDirectoryCreationJob(eStoreData)
 *   .then(() => console.log('Facility directory creation job completed'))
 *   .catch((error) => console.error('Facility directory creation job failed', error));
 */
export const eStoreFacilityDirectoryCreationJob = async (eStoreData: Estore): Promise<void> => {
  try {
    const invalidParams =
      !eStoreData?.dealId ||
      !eStoreData?.siteId ||
      !eStoreData?.facilityIdentifiers ||
      !eStoreData?.exporterName ||
      !eStoreData?.buyerName ||
      !eStoreData?.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('Invalid arguments provided for eStore facility directory creation');
      return;
    }

    const { dealId, siteId, facilityIdentifiers, exporterName, buyerName, dealIdentifier } = eStoreData;

    console.info('Attempting to create a facility directory %s for deal %s', facilityIdentifiers, dealIdentifier);

    // Initiate the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.FACILITY,
    });

    // Create the facility directory
    const responses: FacilityFolderResponse[] | EstoreErrorResponse[] = await Promise.all(
      facilityIdentifiers.map((facilityIdentifier: number) =>
        createFacilityFolder(siteId, dealIdentifier, {
          facilityIdentifier,
          buyerName,
          exporterName,
        }),
      ),
    );

    /**
     * When all facilities directories have been created with status
     * code `200` and `201`.
     */
    const allFacilitiesCreated = responses.every((facility) => ACCEPTABLE_STATUSES.includes(facility?.status));

    /**
     * When either one or more than one facility directory creation has failed.
     * This can be due to deal directory creation still in progress which will
     * return `400` or due to any other unknown reason.
     */
    const someFacilitiesFailed = responses.some((response) => response?.status === Number(HttpStatusCode.BadRequest));

    // Validate each and every response status code
    if (allFacilitiesCreated) {
      console.info('Facility %s directory has been created for deal %s', facilityIdentifiers, dealIdentifier);

      // Update `cron-job-logs`
      await EstoreRepo.updateByDealId(dealId, {
        'cron.facility': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          timestamp: getNowAsEpoch(),
        },
      });

      // Stop the CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.FACILITY,
        kill: true,
      });

      // Initiate document upload
      await eStoreDocumentsCreationJob(eStoreData);
    } else if (someFacilitiesFailed) {
      console.info('⚡ eStore deal directory %s creation is still in progress for deal %s', dealIdentifier, dealIdentifier);

      // Update status
      await EstoreRepo.updateByDealId(dealId, {
        'cron.facility': {
          status: ESTORE_CRON_STATUS.RUNNING,
          timestamp: getNowAsEpoch(),
        },
      });
    } else {
      throw new Error(`eStore facility directory creation has failed for deal ${dealIdentifier} ${JSON.stringify(responses)}`);
    }
  } catch (error) {
    // Update `cron-job-logs`
    await EstoreRepo.updateByDealId(eStoreData?.dealId, {
      'cron.facility': {
        error: String(error),
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Stop the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.FACILITY,
      kill: true,
    });

    console.error('❌ eStore facility directory creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
