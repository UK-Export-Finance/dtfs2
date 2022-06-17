import { getCollection } from '../database';
import { Estore } from '../interfaces';
import { ESTORE_CRON_STATUS } from '../constants';
import { eStoreCronJobManager } from './eStoreCronJobManager';
import { createFacilityFolder, uploadSupportingDocuments } from '../v1/controllers/estore/eStoreApi';

export const eStoreFacilityFolderCreationJob = async (eStoreData: Estore) => {
  try {
    const cronJobLogsCollection = await getCollection('cron-job-logs');
    // create the Facility folders
    const facilityFoldersResponse: any = await Promise.all(
      eStoreData.facilityIdentifiers.map((facilityIdentifier: number) =>
        createFacilityFolder(eStoreData.siteName, eStoreData.dealIdentifier, {
          exporterName: eStoreData.exporterName,
          buyerName: eStoreData.buyerName,
          facilityIdentifier: facilityIdentifier.toString(),
          destinationMarket: eStoreData.destinationMarket,
          riskMarket: eStoreData.riskMarket,
        }),
      ),
    );
    if (facilityFoldersResponse.every((item: any) => item.status === 201)) {
      console.info('Cron task completed: Facility folders have been successfully created');

      // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
      await cronJobLogsCollection.updateOne(
        { dealId: eStoreData.dealId },
        {
          $set: {
            'facilityCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
            'facilityCronJob.completionDate': new Date(),
          },
        },
      );

      // stop and the delete the cron job - this in order to release the memory
      eStoreCronJobManager.deleteJob(`Facility${eStoreData.dealId}`);

      // check if there are any supporting documents
      if (eStoreData.supportingInformation.length) {
        console.info('Task started: Upload the supporting documents');
        const uploadDocuments = Promise.all(
          eStoreData.supportingInformation.map((file: any) =>
            uploadSupportingDocuments(eStoreData.siteName, eStoreData.dealIdentifier, eStoreData.buyerName, { ...file }),
          ),
        );
        uploadDocuments.then((response) => console.info('Task completed: Supporting documents uploaded successfully', response[0].data));
        uploadDocuments.catch((e) => console.error('Task failed: There was a problem uploading the documents', { e }));
      }
    } else {
      eStoreCronJobManager.deleteJob(`Facility${eStoreData.dealId}`);
      console.error(`Unable to create the Facility Folders for ${eStoreData.dealIdentifier} deal`, facilityFoldersResponse);
      // update the record inside `cron-job-logs` collection to indicate that the cron job failed
      await cronJobLogsCollection.updateOne(
        { dealId: eStoreData.dealId },
        { $set: { facilityFoldersResponse, 'facilityCronJob.status': ESTORE_CRON_STATUS.FAILED, 'facilityCronJob.completionDate': new Date() } },
      );
    }
  } catch (error) {
    console.error('Unable to create the facility folders ', { error });
    // stop and the delete the cron job - this in order to release the memory
    eStoreCronJobManager.deleteJob(`Facility${eStoreData.dealId}`);
  }
};
