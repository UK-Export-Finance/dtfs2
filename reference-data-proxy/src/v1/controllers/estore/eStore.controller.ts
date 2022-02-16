import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import CronJobManager from 'cron-job-manager';
import { getCollection } from '../../../database';
import { Estore, EstoreSite, EstoreBuyer, EstoreDealFolder, EstoreFacilityFolder, EstoreDealFiles, EstoreTermStore } from '../../../interfaces';
import { ESTORE_SITE_CREATION_STATUS, ESTORE_CRON_TYPE, ESTORE_CRON_STATUS } from '../../../constants';

dotenv.config();
const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;
const username: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY;
const password: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET;

const siteCreationTimer = '15 2 * * * *';
const folderCreationTimer = '35 * * * * *';

// ensure that the `data` parameter has only these types
const postToEstore = async (
  apiEndpoint: string,
  data: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
) => {
  if (!eStoreUrl) {
    return false;
  }

  console.info('Calling eStore API', apiEndpoint, data);

  const response = await axios({
    method: 'post',
    url: `${eStoreUrl}/${apiEndpoint}`,
    auth: { username, password },
    headers: { 'Content-Type': 'application/json' },
    data,
  }).catch((error: any) => {
    console.error(`Error calling eStore API (/${apiEndpoint}): ${error?.response?.status} \n`, error?.response?.data);
    return error.response.data;
  });

  return response;
};

const siteExists = async (exporterName: EstoreSite) => {
  console.info('Checking if the Site exists', exporterName);
  const response = await postToEstore(`site/exist`, [exporterName]);
  return response;
};

const createExporterSite = async (exporterName: EstoreSite) => {
  console.info('Creating eStore site ', [exporterName]);

  const response = await postToEstore('site', [exporterName]);
  return response;
};

const addFacilityToTermStore = async (siteName: string, facilityId: EstoreTermStore) => {
  console.info('Adding the facilityIds to termStore in eStore ', siteName, [facilityId]);
  await postToEstore(`term/facility`, facilityId);
};

const createBuyerFolder = async (siteName: string, buyerName: EstoreBuyer) => {
  console.info('Creating Buyer folder ', siteName, [buyerName]);
  await postToEstore(`site/${siteName}/buyer`, [buyerName]);
};
const createDealFolder = async (siteName: string, data: EstoreDealFolder) => {
  console.info('Creating Deal folder ', siteName, [data]);
  await postToEstore(`site/${siteName}/deal`, [data]);
};
const createFacilityFolder = async (siteName: string, dealIdentifier: string, data: EstoreFacilityFolder) => {
  console.info('Creating Facility folder ', siteName, dealIdentifier, [data]);
  await postToEstore(`site/${siteName}/deal/${dealIdentifier}/facility`, [data]);
};

// @ts-ignore
const uploadSupportingDocuments = async (siteName: string, dealIdentifier: string, buyerName: string, file: EstoreDealFiles) => {
  console.info('Uploading Supporting Documents ', siteName, dealIdentifier, buyerName, [file]);
  await postToEstore(`site/${siteName}/deal/${dealIdentifier}/documents?buyerName=${buyerName}`, [file]);
};

const eStoreSiteManager = new CronJobManager(
  'eStoreSiteCreationJob',
  '1 * * * * *', // run task as soon as the server is ready (1 = 1 second)
  () => {
    eStoreSiteManager.stop('eStoreSiteCreationJob');
  },
  {
    start: true,
    onComplete: async () => {
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({ status: 'eStore Site Creation Manager started successfully', timestamp: Date.now() });
      console.info('eStore Site Creation Manager started successfully');
    },
    timezone: 'Europe/London',
  },
);

const eStoreDealFolderManager = new CronJobManager(
  'dealFolderCreationJob', // unique key used to identify the current cron job
  '1 * * * * *', // run task as soon as the server is ready (1 = 1 second)
  () => {
    // stop the current job - we only need it to execute once
    eStoreDealFolderManager.stop('dealFolderCreationJob');
  },
  {
    start: true,
    onComplete: async () => {
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({ status: 'eStore Deal Folder Manager started successfully', timestamp: Date.now() });
      console.info('eStore Deal Folder Manager started successfully');
    },
    timezone: 'Europe/London',
  },
);

const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  console.info('eStore Deal Folder Creation Job', eStoreData);

  // create the Buyer folder
  console.info('Cron task: Create the Buyer folder');
  await createBuyerFolder(eStoreData.siteName, { exporterName: eStoreData.exporterName, buyerName: eStoreData.buyerName });

  // create the Deal folder
  console.info('Cron task: Create the Deal folder');
  await createDealFolder(eStoreData.siteName, {
    exporterName: eStoreData.exporterName,
    buyerName: eStoreData.buyerName,
    dealIdentifier: eStoreData.dealIdentifier,
    destinationMarket: eStoreData.destinationMarket,
    riskMarket: eStoreData.riskMarket,
  });

  console.info('Cron task: Create the Facility folder');
  // create Facility folders
  await Promise.all(
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

  console.info('Cron task: Upload the supporting documents');
  // const uploadDocuments = Promise.all(
  //   eStoreData.supportingInformation.map((file: any) =>
  //     uploadSupportingDocuments(eStoreData.siteName, eStoreData.dealIdentifier, eStoreData.buyerName, { ...file }),
  //   ),
  // );
  // uploadDocuments.then((results) => console.info('Cron task: Supporting documents uploaded successfully', results));
  // uploadDocuments.catch((e) => console.error('There was a problem uploading the documents', e));

  // stop and the delete the cron job - this in order to release the memory
  eStoreDealFolderManager.deleteJob(eStoreData.dealIdentifier);
  const collection = await getCollection('cron-job-logs');
  // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
  await collection.findOneAndUpdate(
    { siteName: eStoreData.siteName, cronType: ESTORE_CRON_TYPE.FOLDER_CREATION },
    { $set: { cronStatus: ESTORE_CRON_STATUS.COMPLETED, completionTimestamp: Date.now() } },
  );
};

const eStoreSiteCreationJob = async (exporterName: string) => {
  console.info('eStore Site Creation job started ', exporterName);
  const response = await siteExists({ exporterName });
  console.log(response.siteName, response.status);

  if (response?.status === ESTORE_SITE_CREATION_STATUS.CREATED) {
    console.info('eStore Site was created successfully');
    // stop and delete the cron job - this in order to release the memory
    eStoreSiteManager.deleteJob(response.siteName);
    const collection = await getCollection('cron-job-logs');
    // update the record inside `cron-job-logs` collection to indicate that the cron job finished executing
    const eStoreData = await collection.findOneAndUpdate(
      { siteName: response.siteName, cronType: ESTORE_CRON_TYPE.SITE_CREATION },
      { $set: { cronStatus: ESTORE_CRON_STATUS.COMPLETED, completionTimestamp: Date.now() } },
    );
    console.log('eStoreSiteCreationJob eStoreData ', { eStoreData });

    // add a new job to the `deal folder manager` cron job that runs very 35 seconds
    eStoreDealFolderManager.add(eStoreData.dealIdentifier, folderCreationTimer, () => {
      eStoreDealFolderCreationJob(eStoreData);
    });
  }
};

/* {
  exporter: NAME,
  buyer: NAME,
  "dealIdentifier": "0040000449",
  "destinationMarket": "United Kingdom",
  "riskMarket": "United States",
  facilityIdentifiers: [0040000450]
} */

export const createEstore = async (req: Request, res: Response) => {
  const eStoreData = req.body;
  console.log('🚀 ~ file: eStore.controller.ts ~ line 198 ~ createEstore ~ eStoreData', eStoreData);

  if (eStoreData) {
    const { siteName, status } = await siteExists({ exporterName: eStoreData.exporterName });
    console.log({ siteName }, { status });
    // check if site already exists in eStore
    if (status === ESTORE_SITE_CREATION_STATUS.CREATED) {
      // keep track of each new folder creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({
        siteName,
        cronType: ESTORE_CRON_TYPE.FOLDER_CREATION,
        cronStatus: ESTORE_CRON_STATUS.RUNNING,
        creationTimestamp: Date.now(),
        buyerName: eStoreData.buyerName,
        dealIdentifier: eStoreData.dealIdentifier,
        destinationMarket: eStoreData.destinationMarket,
        facilityIdentifiers: eStoreData.facilityIdentifiers,
        supportingInformation: eStoreData.supportingInformation,
      });

      // add facilityIds to TermStore
      await Promise.all(eStoreData.facilityIdentifiers.map((facilityId: number) => addFacilityToTermStore(siteName, { id: facilityId?.toString() })));

      // add a new job to the deal folder manager that runs very 35 seconds
      // in general, the folder creation should take between 20 to 30 seconds
      eStoreDealFolderManager.add(eStoreData.dealIdentifier, folderCreationTimer, () => {
        eStoreDealFolderCreationJob(eStoreData);
      });
    } else {
      // keep track of each new site creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({
        siteName,
        cronType: ESTORE_CRON_TYPE.SITE_CREATION,
        cronStatus: ESTORE_CRON_STATUS.RUNNING,
        creationTimestamp: Date.now(),
        buyerName: eStoreData.buyerName,
        dealIdentifier: eStoreData.dealIdentifier,
        destinationMarket: eStoreData.destinationMarket,
        facilityIdentifiers: eStoreData.facilityIdentifiers,
        supportingInformation: eStoreData.supportingInformation,
      });

      // send a request to estore to start creating the eStore site
      await createExporterSite({ exporterName: siteName });

      // add facilityIds to TermStore
      await Promise.all(eStoreData.facilityIdentifiers.map((facilityId: number) => addFacilityToTermStore(siteName, { id: facilityId?.toString() })));

      // add a new job to the `site creation manager` queue that runs very 2 minutes and 15 seconds
      // in general, the site creation should take around 4 minutes, but we can check regularly when the site is created
      eStoreSiteManager.add(siteName, siteCreationTimer, async () => {
        await eStoreSiteCreationJob(siteName);
      });
    }

    return res.status(200);
  }
};
