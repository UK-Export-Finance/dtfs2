import { Request, Response } from 'express';
import { getCollection } from '../../../database';
import { Estore } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_TYPE, ESTORE_CRON_STATUS, DEAL_TYPE } from '../../../constants';
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

const siteCreationTimer = '40 * * * * *';
const folderCreationTimer = '30 * * * * *';
const facilityCreationTimer = '30 * * * * *';

const eStoreFacilityFolderCreationJob = async (eStoreData: Estore) => {
  if (eStoreData.facilityIdentifiers.length) {
    // create the Facility folders
    const facilityFoldersResponse: any = await Promise.all(
      eStoreData.facilityIdentifiers.map((facilityIdentifier: number) =>
        createFacilityFolder(eStoreData.siteName, eStoreData.dealIdentifier, {
          exporterName: eStoreData.exporterName,
          buyerName: eStoreData.buyerName,
          facilityIdentifier: facilityIdentifier?.toString(),
          destinationMarket: eStoreData.destinationMarket,
          riskMarket: eStoreData.riskMarket,
        }),
      ),
    );
    if (facilityFoldersResponse[0].status === 201) {
      console.info('Cron task completed: Facility folders have been successfully created');
      // stop and the delete the cron job - this in order to release the memory
      eStoreCronJobManager.deleteJob(`F${eStoreData.dealIdentifier}`);

      console.info('Task started: Upload the supporting documents');
      const uploadDocuments = Promise.all(
        eStoreData.supportingInformation.map((file: any) =>
          uploadSupportingDocuments(eStoreData.siteName, eStoreData.dealIdentifier, eStoreData.buyerName, { ...file }),
        ),
      );
      uploadDocuments.then((response) => console.info('Task completed: Supporting documents uploaded successfully', response[0].data));
      uploadDocuments.catch((e) => console.error('Task failed: There was a problem uploading the documents', { e }));
    } else {
      // stop and delete the cron job - this to release the memory
      eStoreCronJobManager.deleteJob(`F${eStoreData.dealIdentifier}`);
      console.error(`Unable to create the Facility Folders for ${eStoreData.dealIdentifier} deal`, facilityFoldersResponse);
    }
  } else {
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(`F${eStoreData.dealIdentifier}`);
    console.error(
      `Unable to create the Facility Folders for ${eStoreData.dealIdentifier} deal. The current deal does not have any facility identifiers`,
      eStoreData?.facilityIdentifiers,
    );
  }
};

const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  // create the Deal folder
  console.info('API Call started: Create the Deal folder for: ', eStoreData.dealIdentifier);
  const dealFolderResponse = await createDealFolder(eStoreData.siteName, {
    exporterName: eStoreData.exporterName,
    buyerName: eStoreData.buyerName,
    dealIdentifier: eStoreData.dealIdentifier,
    destinationMarket: eStoreData.destinationMarket,
    riskMarket: eStoreData.riskMarket,
  });
  if (dealFolderResponse.status === 201) {
    console.info('API Call finished: The Deal folder was successfully created');
    // stop and the delete the cron job to release the memory
    eStoreCronJobManager.deleteJob(`D${eStoreData.dealIdentifier}`);

    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    await cronJobLogsCollection.findOneAndUpdate(
      { siteName: eStoreData.siteName, cronType: ESTORE_CRON_TYPE.DEAL_FOLDER_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.COMPLETED, completionTimestamp: Date.now() } },
    );

    // keep track of each new facility folder creation jobs
    // we do this by adding a new item inside the `cron-job-logs` collection
    await cronJobLogsCollection.insertOne({
      exporterName: eStoreData.exporterName,
      siteName: eStoreData.siteName,
      cronType: ESTORE_CRON_TYPE.FACILITY_FOLDER_CREATION,
      cronStatus: ESTORE_CRON_STATUS.RUNNING,
      creationTimestamp: Date.now(),
      buyerName: eStoreData.buyerName,
      dealIdentifier: eStoreData.dealIdentifier,
      destinationMarket: eStoreData.destinationMarket,
      riskMarket: eStoreData.riskMarket,
      facilityIdentifiers: eStoreData.facilityIdentifiers,
      supportingInformation: eStoreData.supportingInformation,
    });

    // add a new job to the `Cron Job Manager` to create the Facility Folders for the current Deal
    eStoreCronJobManager.add(`F${eStoreData.dealIdentifier}`, facilityCreationTimer, async () => {
      await eStoreFacilityFolderCreationJob(eStoreData);
    });
    console.info('Cron task started: Create the Facility folder');
    eStoreCronJobManager.start(`F${eStoreData.dealIdentifier}`);
  } else {
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(`D${eStoreData.dealIdentifier}`);
    // update the record inside `cron-job-logs` collection to indicate that the cron job failed
    await cronJobLogsCollection.findOneAndUpdate(
      { siteName: eStoreData.siteName, cronType: ESTORE_CRON_TYPE.DEAL_FOLDER_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.FAILED, completionTimestamp: Date.now() } },
    );
    console.error(`API Call failed: Unable to create a Deal Folder for ${eStoreData.dealIdentifier}`, { dealFolderResponse });
  }
};

const eStoreSiteCreationJob = async (exporterName: string) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');

  console.info('API Call (Cron Job): Checking if the site exists');
  const response = await siteExists({ exporterName });

  // check if the site has been created
  if (response?.data?.status === ESTORE_SITE_STATUS.CREATED) {
    console.info('Cron job: eStore Site has been created: ', response.data.siteName);
    // stop and delete the cron job, to release the memory
    eStoreCronJobManager.deleteJob(response.data.siteName);
    // update the record inside `cron-job-logs` collection to indicate that the cron job completed successfully
    const eStoreData = await cronJobLogsCollection.findOneAndUpdate(
      { siteName: response.data.siteName, cronType: ESTORE_CRON_TYPE.SITE_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.COMPLETED, completionTimestamp: Date.now() } },
    );
    eStoreData.siteName = response.data.siteName;

    // keep track of each new deal folder creation jobs
    // we do this by adding a new item inside the `cron-job-logs` collection
    await cronJobLogsCollection.insertOne({
      exporterName: eStoreData.exporterName,
      siteName: eStoreData.siteName,
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

    // add a new job to the `Cron Job Manager` queue to create a Deal Folder
    eStoreCronJobManager.add(`D${eStoreData.dealIdentifier}`, folderCreationTimer, async () => {
      await eStoreDealFolderCreationJob(eStoreData);
    });
    console.info('Cron job started: Create the Deal folder');
    eStoreCronJobManager.start(`D${eStoreData.dealIdentifier}`);
  } else if (response?.data?.status === ESTORE_SITE_STATUS.PROVISIONING) {
    console.info('Cron job continues: eStore Site Creation Cron Job continues to run');
  } else {
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(response.data.siteName);
    // update the record inside `cron-job-logs` collection
    await cronJobLogsCollection.findOneAndUpdate(
      { siteName: response.data.siteName, cronType: ESTORE_CRON_TYPE.SITE_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.FAILED, completionTimestamp: Date.now() } },
    );
    console.error(`API Call (Cron Job) failed: Unable to create a new site for ${exporterName}`, response);
  }
};

export const createEstore = async (req: Request, res: Response) => {
  const eStoreData = req.body;
  console.log('🚀 ~ file: eStore.controller.ts ~ line 198 ~ createEstore ~ eStoreData', eStoreData);

  // check if the body is not empty
  if (Object.keys(eStoreData).length) {
    const cronJobLogsCollection = await getCollection('cron-job-logs');

    console.info('API Call: Checking if the site exists');
    const response = await siteExists({ exporterName: eStoreData.exporterName });
    // check if site already exists in eStore
    if (response?.data?.status === ESTORE_SITE_STATUS.CREATED) {
      // keep track of each new folder creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      await cronJobLogsCollection.insertOne({
        exporterName: eStoreData.exporterName,
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
      console.info('API Call started: Add facilityIds to TermStore');
      const termStoreResponse: any = await Promise.all(eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id?.toString() })));
      // console.log('termStoreResponse', termStoreResponse);
      if (termStoreResponse[0].status === 201) {
        console.info('API Call finished: The facilityIds were added to TermStore successfully');

        console.info('API Call started: Create the Buyer folder for ', eStoreData.buyerName);
        let buyerFolderResponse;
        if (eStoreData.dealType === DEAL_TYPE.GEF) {
          // GEF deals do NOT have a buyer. In that case, we don't need to call the `createBuyerFolder` endpoint
          buyerFolderResponse = { status: 201, statusText: ESTORE_SITE_STATUS.CREATED };
        } else {
          // create the Buyer folder
          buyerFolderResponse = await createBuyerFolder(eStoreData.siteName, { exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName });
        }

        if (buyerFolderResponse.status === 201 && buyerFolderResponse.statusText === ESTORE_SITE_STATUS.CREATED) {
          console.info(`API Call finished: TheBuyer folder for ${eStoreData.buyerName} was successfully created`);
          // add a new job to the `Cron Job manager` queue that runes every 35 seconds
          // in general, the folder creation should take between 20 to 30 seconds
          eStoreCronJobManager.add(`D${eStoreData.dealIdentifier}`, folderCreationTimer, async () => {
            await eStoreDealFolderCreationJob(eStoreData);
          });
          console.info('Cron job started: eStore Deal folder Cron Job started');
          eStoreCronJobManager.start(`D${eStoreData.dealIdentifier}`);
        } else {
          console.error(`API Call failed: Unable to create the buyer folder for ${eStoreData.buyerName}`, buyerFolderResponse);
        }
      }
    } else if (response?.response?.data?.status === 404 && response?.response?.data?.siteName === '') {
      // keep track of each site creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      await cronJobLogsCollection.insertOne({
        exporterName: eStoreData.exporterName,
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
      console.info('API Call started: Add facilityIds to TermStore');
      const termStoreResponse: any = await Promise.all(eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id?.toString() })));

      if (termStoreResponse[0].status === 201) {
        console.info('API Call finished: The facilityIds were added to TermStore successfully');
        // send a request to eStore to start creating the eStore site
        console.info('API Call started: Create a new eStore site for ', eStoreData.exporterName);
        const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

        // check if the siteCreation endpoint returns a siteName - this is usually a number (i.e. 12345)
        if (siteCreationResponse?.data?.siteName) {
          // add a new job to the `Cron Job manager` queue that runs every 40 seconds
          // in general, the site creation should take around 4 minutes, but we can check regularly to see if the site was created
          eStoreCronJobManager.add(siteCreationResponse.data.siteName, siteCreationTimer, async () => {
            await eStoreSiteCreationJob(eStoreData.exporterName);
          });
          console.info('Cron job started: eStore Site Creation Cron Job started ', siteCreationResponse.data.siteName);
          eStoreCronJobManager.start(siteCreationResponse.data.siteName);
        } else {
          console.error('API Call failed: Unable to create a new site in eStore', { siteCreationResponse });
        }
      } else {
        console.error('API Call failed: Unable to add the facilityIds to TermStore', { termStoreResponse });
      }
    } else {
      console.error('API Call failed: Unable to check if a site exists', { response });
    }

    return res.status(200).send();
  }
  console.error('eStore body is empty', { eStoreData });
  return res.status(400).send({ message: 'eStore body is empty', status: 400 });
};
