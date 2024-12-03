import { HttpStatusCode } from 'axios';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { AzureDocument, EstoreDocument, DocumentCreationResponse, EstoreErrorResponse, Estore } from '../interfaces';
import { cron } from '../helpers/cron';
import { ENDPOINT, ESTORE_CRON_STATUS } from '../constants';
import { uploadSupportingDocuments } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

const ACCEPTABLE_STATUSES = [HttpStatusCode.Ok, HttpStatusCode.Created];

/**
 * The `eStoreDocumentsCreationJob` function is responsible for uploading supporting documents
 * to the eStore for a given eStore data object. It validates the input parameters, initiates a CRON job,
 * and attempts to upload each supporting document. If the request body is invalid, it logs an error and returns.
 *
 * @param {Estore} eStoreData - The eStore data object containing information about the deal, site, buyer, and supporting documents.
 *
 * @returns {Promise<void>} - A promise that resolves when the job is complete.
 *
 * @example
 * const eStoreData = {
 *   dealId: '507f1f77bcf86cd799439011',
 *   siteId: 'site123',
 *   buyerName: 'Buyer LLC',
 *   supportingInformation: [
 *     {
 *       documentType: 'pdf',
 *       fileName: 'document1.pdf',
 *       fileLocationPath: '/path/to/document1.pdf',
 *       parentId: 'parent123',
 *     },
 *   ],
 *   dealIdentifier: 'deal123',
 * };
 *
 * eStoreDocumentsCreationJob(eStoreData)
 *   .then(() => console.log('Documents creation job completed'))
 *   .catch((error) => console.error('Documents creation job failed', error));
 */
export const eStoreDocumentsCreationJob = async (eStoreData: Estore): Promise<void> => {
  try {
    const invalidParams =
      !eStoreData?.dealId || !eStoreData?.siteId || !eStoreData?.buyerName || !eStoreData?.supportingInformation || !eStoreData?.dealIdentifier;

    // Argument validation
    if (invalidParams) {
      console.error('⚠️ Invalid arguments provided for eStore supporting documents creation');
      return;
    }

    const { dealId, siteId, buyerName, supportingInformation, dealIdentifier } = eStoreData;

    // No documents to be uploaded
    if (!supportingInformation.length) {
      console.info('✅ %i supporting documents for deal %s', supportingInformation.length, dealIdentifier);

      // Update `cron-job-logs`
      await EstoreRepo.updateByDealId(dealId, {
        'cron.document': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          timestamp: getNowAsEpoch(),
        },
      });
    }

    console.info('Attempting to create a %i supporting documents for deal %s', supportingInformation.length, dealIdentifier);

    // Initiate the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.DOCUMENT,
    });

    // Create the facility directory
    const responses: DocumentCreationResponse[] | EstoreErrorResponse[] = await Promise.all(
      supportingInformation.map((document: AzureDocument) => {
        const file: EstoreDocument = {
          ...document,
          buyerName,
        };
        return uploadSupportingDocuments(siteId, dealIdentifier, file);
      }),
    );

    /**
     * When all the supporting documents have been uploaded to eStore with response
     * code `200` and `201`.
     */
    const allDocumentsCreated = responses.every((document) => ACCEPTABLE_STATUSES.includes(document?.status));

    /**
     * When either one or more than one documents creation has failed
     */
    const someDocumentsFailed = responses.some((document) => document?.status === Number(HttpStatusCode.BadRequest));

    /**
     * When either one or more documents upload fail due to any internal server error.
     * This can happen due to duplicate documents, connection termination (leaving temporary files on eStore)
     * and for any other unknown reason
     */
    const anyInternalServerErrorDocument = responses.some((document) => document?.status === Number(HttpStatusCode.InternalServerError));

    // Validate each and every response status code
    if (allDocumentsCreated) {
      console.info('✅ All %i supporting documents have been created for deal %s', supportingInformation.length, dealIdentifier);

      // Update `cron-job-logs`
      await EstoreRepo.updateByDealId(dealId, {
        'cron.document': {
          status: ESTORE_CRON_STATUS.COMPLETED,
          timestamp: getNowAsEpoch(),
        },
      });

      // Stop the CRON job
      cron({
        data: eStoreData,
        category: ENDPOINT.DOCUMENT,
        kill: true,
      });
    } else if (someDocumentsFailed) {
      console.info('⚡ eStore documents creation is still in progress for deal %s', dealIdentifier);

      // Update status
      await EstoreRepo.updateByDealId(dealId, {
        'cron.document': {
          status: ESTORE_CRON_STATUS.RUNNING,
          timestamp: getNowAsEpoch(),
        },
      });
    } else if (anyInternalServerErrorDocument) {
      throw new Error(JSON.stringify(responses));
    } else {
      throw new Error(`eStore documents creation have failed for deal ${dealIdentifier} ${JSON.stringify(responses)}`);
    }
  } catch (error) {
    // Update `cron-job-logs`
    await EstoreRepo.updateByDealId(eStoreData?.dealId, {
      'cron.document': {
        error: String(error),
        status: ESTORE_CRON_STATUS.FAILED,
        timestamp: getNowAsEpoch(),
      },
    });

    // Stop the CRON job
    cron({
      data: eStoreData,
      category: ENDPOINT.DOCUMENT,
      kill: true,
    });

    console.error('❌ eStore documents creation has failed for deal %s %o', eStoreData?.dealId, error);
  }
};
