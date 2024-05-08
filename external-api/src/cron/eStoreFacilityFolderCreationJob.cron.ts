/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import { generateSystemAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream';
import { getCollection } from '../database';
import { Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { createFacilityFolder, uploadSupportingDocuments } from '../v1/controllers/estore/eStoreApi';

const FACILITY_FOLDER_MAX_RETRIES = 3;

export const eStoreFacilityFolderCreationJob = async (eStoreData: Estore) => {
  try {
    const cronJobLogsCollection = await getCollection('cron-job-logs');
    const response = await cronJobLogsCollection.findOneAndUpdate(
      { dealId: { $eq: eStoreData.dealId } },
      { $inc: { facilityFolderRetries: 1 }, $set: { auditRecord: generateSystemAuditDatabaseRecord() } },
      { returnDocument: 'after' },
    );

    if (response?.value?.facilityFolderRetries <= FACILITY_FOLDER_MAX_RETRIES) {
      console.info('Cron task started: Create the Facility folders %s', response?.value?.facilityFolderRetries);
      // create the Facility folders
      const facilityFoldersResponse: any = await Promise.all(
        eStoreData.facilityIdentifiers.map((facilityIdentifier: number) =>
          createFacilityFolder(eStoreData.siteId, eStoreData.dealIdentifier, {
            exporterName: eStoreData.exporterName,
            buyerName: eStoreData.buyerName,
            facilityIdentifier: facilityIdentifier.toString(),
          }),
        ),
      );

      if (facilityFoldersResponse.every((item: any) => item.status === 201)) {
        console.info('Cron task completed: Facility folders have been successfully created');

        // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
        await cronJobLogsCollection.updateOne(
          { dealId: { $eq: eStoreData.dealId } },
          {
            $set: {
              'facilityCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
              'facilityCronJob.completionDate': new Date(),
              auditRecord: generateSystemAuditDatabaseRecord(),
            },
          },
        );

        // check if there are any supporting documents
        if (eStoreData.supportingInformation.length) {
          console.info('Task started: Upload the supporting documents');
          const uploadDocuments = Promise.all(
            eStoreData.supportingInformation.map((file: any) =>
              uploadSupportingDocuments(eStoreData.siteId, eStoreData.dealIdentifier, {
                ...file,
                buyerName: eStoreData.buyerName,
              }),
            ),
          );
          // eslint-disable-next-line prettier/prettier
          uploadDocuments.then((res) =>
            console.info('Task completed: Supporting documents uploaded successfully %o', res[0].data),
          );
          // eslint-disable-next-line prettier/prettier
          uploadDocuments.catch((error) =>
            console.error('Task failed: There was a problem uploading the documents %o', error),
          );
        }
      }
    } else {
      console.error('Unable to create the facility folders');
      // update the record inside `cron-job-logs` collection to indicate that the cron job failed
      await cronJobLogsCollection.updateOne(
        { dealId: { $eq: eStoreData.dealId } },
        {
          $set: {
            'facilityCronJob.status': ESTORE_CRON_STATUS.FAILED,
            'facilityCronJob.failureDate': new Date(),
            auditRecord: generateSystemAuditDatabaseRecord(),
          },
        },
      );
    }
  } catch (error) {
    console.error('Unable to create the facility folders %o', error);
    // stop and the delete the cron job - this in order to release the memory
  }
};
