import { Request, Response } from 'express';
import { getCollection } from '../../../database';
import { Estore, TermStoreResponse, BuyerFolderResponse, SiteExistsResponse } from '../../../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../../../constants';
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

const siteCreationTimer = '50 * * * * *';
const folderCreationTimer = '30 * * * * *';
const facilityCreationTimer = '30 * * * * *';

const eStoreFacilityFolderCreationJob = async (eStoreData: Estore) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  if (eStoreData.facilityIdentifiers.length) {
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
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        {
          $set: {
            'facilityCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
            'facilityCronJob.completionDate': Date.now(),
          },
        },
      );

      // stop and the delete the cron job - this in order to release the memory
      eStoreCronJobManager.deleteJob(`Facility${eStoreData.dealIdentifier}`);

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
      eStoreCronJobManager.deleteJob(`Facility${eStoreData.dealIdentifier}`);
      console.error(`Unable to create the Facility Folders for ${eStoreData.dealIdentifier} deal`, facilityFoldersResponse);
      // update the record inside `cron-job-logs` collection to indicate that the cron job failed
      await cronJobLogsCollection.findOneAndUpdate(
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        { $set: { facilityFoldersResponse, 'facilityCronJob.status': ESTORE_CRON_STATUS.FAILED, 'facilityCronJob.completionDate': Date.now() } },
      );
    }
  } else {
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(`Facility${eStoreData.dealIdentifier}`);
    console.error(
      `Unable to create the Facility Folders for ${eStoreData.dealIdentifier} deal. The current deal does not have any facility identifiers`,
      eStoreData?.facilityIdentifiers,
    );
  }
};

const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  // create the Deal folder
  console.info('API Call started: Create the Deal folder for ', eStoreData.dealIdentifier);
  const dealFolderResponse = await createDealFolder(eStoreData.siteName, {
    exporterName: eStoreData.exporterName,
    buyerName: eStoreData.buyerName,
    dealIdentifier: eStoreData.dealIdentifier,
    destinationMarket: eStoreData.destinationMarket,
    riskMarket: eStoreData.riskMarket,
  });
  // check if the API call was successful
  if (dealFolderResponse.status === 201) {
    console.info('API Call finished: The Deal folder was successfully created');
    // stop and the delete the cron job to release the memory
    eStoreCronJobManager.deleteJob(`Deal${eStoreData.dealIdentifier}`);

    // update the `tfm-deals` collection once the buyer and deal folders have been created
    const tfmDealsCollection = await getCollection('tfm-deals');
    tfmDealsCollection.updateOne(
      { 'dealSnapshot.ukefDealId': eStoreData.dealIdentifier },
      { $set: { 'tfm.eStore': { buyerName: eStoreData.buyerName, folderName: dealFolderResponse.data.foldername, siteName: eStoreData.siteName } } },
    );

    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    await cronJobLogsCollection.updateOne(
      { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
      {
        $set: {
          'dealCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
          'dealCronJob.completionDate': Date.now(),
          'facilityCronJob.status': ESTORE_CRON_STATUS.RUNNING,
          'facilityCronJob.startDate': Date.now(),
        },
      },
    );

    // add a new job to the `Cron Job Manager` to create the Facility Folders for the current Deal
    eStoreCronJobManager.add(`Facility${eStoreData.dealIdentifier}`, facilityCreationTimer, async () => {
      await eStoreFacilityFolderCreationJob(eStoreData);
    });
    console.info('Cron task started: Create the Facility folder');
    eStoreCronJobManager.start(`Facility${eStoreData.dealIdentifier}`);
  } else {
    console.error(`API Call failed: Unable to create a Deal Folder for ${eStoreData.dealIdentifier}`, { dealFolderResponse });
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(`Deal${eStoreData.dealIdentifier}`);
    // update the record inside `cron-job-logs` collection to indicate that the cron job failed
    await cronJobLogsCollection.findOneAndUpdate(
      { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
      { $set: { dealFolderResponse, 'dealCronJob.status': ESTORE_CRON_STATUS.FAILED, 'dealCronJob.completionDate': Date.now() } },
    );
  }
};

const eStoreFolders = async (eStoreData: any) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  // add facilityIds to TermStore
  console.info('API Call started: Add facilityIds to TermStore');
  const termStoreResponse: TermStoreResponse[] = await Promise.all(
    eStoreData.facilityIdentifiers.map((id: number) => addFacilityToTermStore({ id: id?.toString() })),
  );
  if (termStoreResponse.every((term) => term.status === 201)) {
    console.info('API Call finished: The facilityIds were added to TermStore successfully');

    console.info('API Call started: Create the Buyer folder for ', eStoreData.buyerName);
    // create the Buyer folder
    const buyerFolderResponse: BuyerFolderResponse = await createBuyerFolder(eStoreData.siteName, {
      exporterName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
    });

    if (buyerFolderResponse.status === 201) {
      console.info(`API Call finished: The Buyer folder for ${eStoreData.buyerName} was successfully created`);
      // add a new job to the `Cron Job manager` queue that runes every 35 seconds
      // in general, the folder creation should take between 20 to 30 seconds
      eStoreCronJobManager.add(`Deal${eStoreData.dealIdentifier}`, folderCreationTimer, async () => {
        await eStoreDealFolderCreationJob(eStoreData);
      });
      // update the database to indicate that the deal cron job started
      await cronJobLogsCollection.updateOne(
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        { $set: { 'dealCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'dealCronJob.startDate': Date.now() } },
      );
      console.info('Cron job started: eStore Deal folder Cron Job started');
      eStoreCronJobManager.start(`Deal${eStoreData.dealIdentifier}`);
    } else {
      console.error(`API Call failed: Unable to create the buyer folder for ${eStoreData.buyerName}`, buyerFolderResponse);
      // update the database to indicate that there was an issue creating the buyer Folder
      await cronJobLogsCollection.updateOne(
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        { $set: { buyerFolderResponse } },
      );
    }
  } else {
    console.error('API Call failed: Unable to add the facilityIds to TermStore', { termStoreResponse });
    // update the database to indicate that there was an issue adding the facilityIds to TermStore
    await cronJobLogsCollection.updateOne(
      { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
      { $set: { termStoreResponse } },
    );
  }
};

const eStoreSiteCreationJob = async (eStoreData: any) => {
  const cronJobLogsCollection = await getCollection('cron-job-logs');
  const data = eStoreData;

  console.info('API Call (Cron Job): Checking if the site exists');
  const siteExistsResponse: SiteExistsResponse = await siteExists({ exporterName: eStoreData.exporterName });

  // check if the site has been created
  if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
    console.info('Cron job: eStore Site has been created: ', siteExistsResponse.data.siteName);
    // stop and delete the cron job, to release the memory
    eStoreCronJobManager.deleteJob(siteExistsResponse.data.siteName);
    data.siteName = siteExistsResponse.data.siteName;

    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    await cronJobLogsCollection.updateOne(
      { dealIdentifier: data.dealIdentifier, exporterName: data.exporterName, buyerName: data.buyerName },
      {
        $set: {
          siteName: siteExistsResponse.data.siteName,
          'siteCronJob.status': ESTORE_CRON_STATUS.COMPLETED,
          'siteCronJob.completionDate': Date.now(),
          'dealCronJob.status': ESTORE_CRON_STATUS.RUNNING,
          'dealCronJob.startDate': Date.now(),
        },
      },
    );

    // add facilityIds to termStore and create the buyer folder
    eStoreFolders(data);
  } else if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING) {
    console.info('Cron job continues: eStore Site Creation Cron Job continues to run');
  } else {
    console.error(`API Call (Cron Job) failed: Unable to create a new site for ${eStoreData.exporterName}`, siteExistsResponse);
    // stop and delete the cron job - this to release the memory
    eStoreCronJobManager.deleteJob(siteExistsResponse.data.siteName);
    // update the record inside `cron-job-logs` collection
    await cronJobLogsCollection.findOneAndUpdate(
      { exporterName: eStoreData.exporterName },
      { $set: { siteExistsResponse, 'siteCronJob.status': ESTORE_CRON_STATUS.FAILED, 'siteCronJob.completionDate': Date.now() } },
    );
  }
};

export const createEstore = async (req: Request, res: Response) => {
  const eStoreData = req.body;
  console.log('🚀 ~ file: eStore.controller.ts ~ line 198 ~ createEstore ~ eStoreData', eStoreData);

  // check if the body is not empty
  if (Object.keys(eStoreData).length) {
    const cronJobLogsCollection = await getCollection('cron-job-logs');

    // keep track of new submissions
    await cronJobLogsCollection.insertOne({
      ...eStoreData,
      timestamp: Date.now(),
      siteExists: false,
      siteName: null,
      facilityCronJob: {
        status: ESTORE_CRON_STATUS.PENDING,
      },
      dealCronJob: {
        status: ESTORE_CRON_STATUS.PENDING,
      },
    });

    console.info('API Call: Checking if the site exists');
    const siteExistsResponse = await siteExists({ exporterName: eStoreData.exporterName });
    // check if site exists in eStore
    if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
      // update the database to indicate that the site exists in eStore
      await cronJobLogsCollection.updateOne(
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        { $set: { siteExists: true, siteName: siteExistsResponse.data.siteName } },
      );

      eStoreData.siteName = siteExistsResponse.data.siteName;

      // add facilityIds to termStore and create the buyer folder
      eStoreFolders(eStoreData);
    } else if (siteExistsResponse?.status === 404 && siteExistsResponse?.data?.siteName === '') {
      // update the database to indicate that a new cron job needs to be created to add a new site to Sharepoint
      await cronJobLogsCollection.updateOne(
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        { $set: { siteCronJob: { status: ESTORE_CRON_STATUS.PENDING } } },
      );

      // send a request to eStore to start creating the eStore site
      console.info('API Call started: Create a new eStore site for ', eStoreData.exporterName);
      const siteCreationResponse = await createExporterSite({ exporterName: eStoreData.exporterName });

      // check if the siteCreation endpoint returns a siteName - this is usually a number (i.e. 12345)
      if (siteCreationResponse?.data?.siteName) {
        // update the database with the new siteName
        await cronJobLogsCollection.updateOne(
          { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
          { $set: { siteName: siteCreationResponse.data.siteName } },
        );
        // add a new job to the `Cron Job Manager` queue that runs every 40 seconds
        // in general, the site creation should take around 4 minutes, but we can check regularly to see if the site was created
        eStoreCronJobManager.add(siteCreationResponse.data.siteName, siteCreationTimer, async () => {
          await eStoreSiteCreationJob(eStoreData);
        });
        console.info('Cron job started: eStore Site Creation Cron Job started ', siteCreationResponse.data.siteName);
        // update the database to indicate that the `site cron job` started
        await cronJobLogsCollection.updateOne(
          { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
          { $set: { 'siteCronJob.status': ESTORE_CRON_STATUS.RUNNING, 'siteCronJob.startDate': Date.now() } },
        );
        eStoreCronJobManager.start(siteCreationResponse.data.siteName);
      } else {
        console.error('API Call failed: Unable to create a new site in eStore', { siteCreationResponse });
        // update the database to indicate that the API call failed
        await cronJobLogsCollection.updateOne(
          { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
          { $set: siteCreationResponse },
        );
      }
    } else {
      console.error('API Call failed: Unable to check if a site exists', { siteExistsResponse });
      // update the database to indicate that the API call failed
      await cronJobLogsCollection.updateOne(
        { dealIdentifier: eStoreData.dealIdentifier, exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName },
        { $set: { siteExistsResponse } },
      );
    }

    return res.status(200).send();
  }
  console.error('eStore body is empty', { eStoreData });
  return res.status(400).send({ message: 'eStore body is empty', status: 400 });
};
