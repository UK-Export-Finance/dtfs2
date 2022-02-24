import { Request, Response } from 'express';
import { getCollection } from '../../../database';
import { Estore } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_TYPE, ESTORE_CRON_STATUS } from '../../../constants';
import { eStoreCronJobManager } from '../../../cronJobs';
import {
  createFacilityFolder,
  createDealFolder,
  createBuyerFolder,
  createExporterSite,
  siteExists,
  addFacilityToTermStore,
  uploadSupportingDocuments,
} from './eStoreApi';

const siteCreationTimer = '35 * * * * *';
const folderCreationTimer = '30 * * * * *';

const eStoreFacilityFolderCreationJob = async (eStoreData: Estore) => {
  console.info('Cron task started: Create the Facility folder');
  // create Facility folders
  const facilityFoldersResponse: any = await Promise.all(
    eStoreData.facilityIdentifiers.map(
      async (facilityIdentifier: number) =>
        // eslint-disable-next-line no-return-await
        await createFacilityFolder(eStoreData.siteName, eStoreData.dealIdentifier, {
          exporterName: eStoreData.exporterName,
          buyerName: eStoreData.buyerName,
          facilityIdentifier: facilityIdentifier?.toString(),
          destinationMarket: eStoreData.destinationMarket,
          riskMarket: eStoreData.riskMarket,
        }),
    ),
  );
  if (facilityFoldersResponse[0].status === 201) {
    console.info('Cron task completed: Facility folder was successfully created');
    // stop and the delete the cron job - this in order to release the memory
    eStoreCronJobManager.deleteJob(`F${eStoreData.dealIdentifier}`);

    console.log(`I got the current jobs: ${eStoreCronJobManager}`);
    console.info('Task started: Upload the supporting documents');
    const uploadDocuments = Promise.all(
      eStoreData.supportingInformation.map(
        // eslint-disable-next-line no-return-await
        async (file: any) => await uploadSupportingDocuments(eStoreData.siteName, eStoreData.dealIdentifier, eStoreData.buyerName, { ...file }),
      ),
    );
    uploadDocuments.then((results) => console.info('Task completed: Supporting documents uploaded successfully', results));
    uploadDocuments.catch((e) => console.error('There was a problem uploading the documents', e));
  }
};

const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  // create the Deal folder
  console.info('Cron task started: Create the Deal folder');
  const dealFolderResponse = await createDealFolder(eStoreData.siteName, {
    exporterName: eStoreData.exporterName,
    buyerName: eStoreData.buyerName,
    dealIdentifier: eStoreData.dealIdentifier,
    destinationMarket: eStoreData.destinationMarket,
    riskMarket: eStoreData.riskMarket,
  });
  if (dealFolderResponse.status === 201) {
    console.info('Cron task completed: Deal folder was successfully created');
    // stop and the delete the cron job - this in order to release the memory
    eStoreCronJobManager.deleteJob(`D${eStoreData.dealIdentifier}`);

    const collection = await getCollection('cron-job-logs');
    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    await collection.findOneAndUpdate(
      { siteName: eStoreData.siteName, cronType: ESTORE_CRON_TYPE.DEAL_FOLDER_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.COMPLETED, completionTimestamp: Date.now() } },
    );

    eStoreCronJobManager.add(`F${eStoreData.dealIdentifier}`, folderCreationTimer, async () => {
      await eStoreFacilityFolderCreationJob(eStoreData);
    });
    eStoreCronJobManager.start(`F${eStoreData.dealIdentifier}`);
  }
};

const eStoreSiteCreationJob = async (exporterName: string) => {
  console.info('eStore Site Creation job started ', exporterName);
  const response = await siteExists({ exporterName });

  if (response?.data?.status === ESTORE_SITE_STATUS.CREATED) {
    console.info('eStore Site exists');
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(response.data.siteName);
    const collection = await getCollection('cron-job-logs');
    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    const eStoreData = await collection.findOneAndUpdate(
      { siteName: response.data.siteName, cronType: ESTORE_CRON_TYPE.SITE_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.COMPLETED, completionTimestamp: Date.now() } },
    );
    console.log('eStoreSiteCreationJob eStoreData ', { eStoreData });
    eStoreData.siteName = response.data.siteName;

    // add a new job to the `cron job manager` cron job that runs very 35 seconds
    eStoreCronJobManager.add(eStoreData.dealIdentifier, folderCreationTimer, async () => {
      await eStoreDealFolderCreationJob(eStoreData);
    });
    eStoreCronJobManager.start(eStoreData.dealIdentifier);
  }
  return '';
};

export const createEstore = async (req: Request, res: Response) => {
  const eStoreData = req.body;
  console.log('🚀 ~ file: eStore.controller.ts ~ line 198 ~ createEstore ~ eStoreData', eStoreData);

  if (eStoreData) {
    const response = await siteExists({ exporterName: eStoreData.exporterName });
    // check if site already exists in eStore
    if (response?.data?.status === ESTORE_SITE_STATUS.CREATED) {
      // keep track of each new folder creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({
        siteName: response.data.siteName,
        cronType: ESTORE_CRON_TYPE.DEAL_FOLDER_CREATION,
        cronStatus: ESTORE_CRON_STATUS.RUNNING,
        creationTimestamp: Date.now(),
        buyerName: eStoreData.buyerName,
        dealIdentifier: eStoreData.dealIdentifier,
        destinationMarket: eStoreData.destinationMarket,
        riskMarket: eStoreData.riskMarket,
        facilityIdentifiers: eStoreData.facilityIdentifiers,
        supportingInformation: eStoreData.supportingInformation,
      });

      eStoreData.siteName = response.data.siteName;

      // add facilityIds to TermStore
      console.info('Step 1 started: Add facilityId to TermStore');
      const termStoreResponse: any = await Promise.all(eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id?.toString() })));
      if (termStoreResponse[0].status === 201) {
        console.info('Step 1 completed: FacilityId added to TermStore successfully');

        console.info('Step 2 started: Create the Buyer folder');
        // create the Buyer folder
        const buyerFolderResponse = await createBuyerFolder(eStoreData.siteName, { exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName });
        if (buyerFolderResponse.status === 201 && buyerFolderResponse.statusText === ESTORE_SITE_STATUS.CREATED) {
          console.info('Step 2 completed: Buyer folder was successfully created');
          // add a new job to the deal folder manager that runs very 35 seconds
          // in general, the folder creation should take between 20 to 30 seconds
          eStoreCronJobManager.add(`D${eStoreData.dealIdentifier}`, folderCreationTimer, async () => {
            await eStoreDealFolderCreationJob(eStoreData);
          });
          eStoreCronJobManager.start(`D${eStoreData.dealIdentifier}`);
        }
      }
    } else {
      // keep track of each new site creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({
        cronType: ESTORE_CRON_TYPE.SITE_CREATION,
        cronStatus: ESTORE_CRON_STATUS.RUNNING,
        creationTimestamp: Date.now(),
        buyerName: eStoreData.buyerName,
        dealIdentifier: eStoreData.dealIdentifier,
        destinationMarket: eStoreData.destinationMarket,
        riskMarket: eStoreData.riskMarket,
        facilityIdentifiers: eStoreData.facilityIdentifiers,
        supportingInformation: eStoreData.supportingInformation,
      });

      // add facilityIds to TermStore
      console.info('Cron task 1: Add FacilityId to TermStore');
      await Promise.all(eStoreData.facilityIdentifiers.map(async (facilityId: number) => addFacilityToTermStore({ id: facilityId?.toString() })));

      // send a request to estore to start creating the eStore site
      const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

      if (siteCreationResponse?.data?.siteName) {
        // add a new job to the `site creation manager` queue that runs very 2 minutes and 15 seconds
        // in general, the site creation should take around 4 minutes, but we can check regularly when the site is created
        eStoreCronJobManager.add(siteCreationResponse.data.siteName, siteCreationTimer, async () => {
          await eStoreSiteCreationJob(eStoreData.exporterName);
        });
        eStoreCronJobManager.start(siteCreationResponse.data.siteName);
      }
    }

    return res.status(200).send();
  }
};
