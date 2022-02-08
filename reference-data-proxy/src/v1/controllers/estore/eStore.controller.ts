import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import CronJobManager from 'cron-job-manager';
// import { CronJob } from 'cron';
import { getCollection } from '../../../database';
import { Estore, EstoreSite } from '../../../interfaces';
import { ESTORE_STATUS } from '../../../constants';

dotenv.config();
const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;
const username: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY;
const password: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET;

const siteCreationTimer = '5 * * * * *';
const folderCreationTimer = '35 * * * * *';

const postToEstore = async (apiEndpoint: string, apiData: any) => {
  if (!eStoreUrl) {
    return false;
  }

  console.info(`Calling eStore API`, apiEndpoint, apiData);

  const response = await axios({
    method: 'post',
    url: `${eStoreUrl}/${apiEndpoint}`,
    auth: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [apiData],
  }).catch((error: any) => {
    console.error(`Error calling eStore API (/${apiEndpoint}): ${error?.response?.status} \n`, error?.response?.data);
    return error.response.data;
  });

  return response;
};

const siteExists = async (exporterName: EstoreSite) => {
  console.info('Checking if the Site exists', exporterName);
  const response = await postToEstore(`site/exist`, exporterName);
  return response;
};

// @ts-ignore
const createExporterSite = async (exporterName: string) => {
  console.info('Creating eStore site', exporterName);

  const response = await postToEstore('site', { exporterName });
  return response;
};
export const createBuyerFolder = async ({ siteName, ...apiData }: any) => {
  console.info('Creating Buyer folder', siteName, apiData);
  await postToEstore(`site/${siteName}/buyer`, apiData);
};
export const createDealFolder = async ({ siteName, ...apiData }: any) => {
  console.info('Creating Deal folder', siteName, apiData);
  await postToEstore(`site/${siteName}/deal`, apiData);
};
export const createFacilityFolder = async ({ siteName, dealIdentifier, ...apiData }: any) => {
  console.info('Creating Facility folder ', siteName, dealIdentifier, apiData);
  await postToEstore(`site/${siteName}/deal/${dealIdentifier}/facility`, apiData);
};

export const uploadSupportingDocuments = async ({ siteName, dealIdentifier, buyerName, ...apiData }: any) => {
  console.info('Uploading Supporting Documents ', siteName, dealIdentifier, buyerName, ...apiData);
  await postToEstore(`site/${siteName}/deal/${dealIdentifier}/documents?buyerName=${buyerName}`, apiData);
};

const eStoreSiteManager = new CronJobManager(
  'eStoreSiteCreationJob',
  '5 * * * * *', // run task every 5 seconds
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
  'dealFolderCreationJob',
  '5 * * * * *', // run task every 5 seconds
  () => {
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

// @ts-ignore
const eStoreSiteCreationJob = async (exporterName: string) => {
  const response = await siteExists({ exporterName });
  console.log(response.siteName, response.status);
  let task;
  if (response.status === 'Created') {
    eStoreSiteManager.deleteJob(response.siteName);
    const collection = await getCollection('cron-job-logs');
    task = await collection.findOneAndUpdate({ siteName: response.siteName }, { $set: { status: 'Completed', completionDate: Date.now() } });
  }
  return task;
};

// @ts-ignore
const eStoreDealFolderCreationJob = async (eStoreData: Estore) => {
  console.log('eStore Deal Folder Creation Job', eStoreData);
  // create the Deal folder
  console.info('Cron task: Creating Deal folder');
  await createDealFolder({
    siteName: eStoreData.siteName,
    exporterName: eStoreData.exporterName,
    buyerName: eStoreData.buyerName,
    dealIdentifier: eStoreData.dealIdentifier,
    destinationMarket: eStoreData.destinationMarket,
    riskMarket: eStoreData.riskMarket,
  });

  console.info('Cron task: Creating Facility folder');
  // create Facility folders
  await Promise.all(
    eStoreData.facilityIdentifiers.map((facilityIdentifier: number) =>
      createFacilityFolder({
        siteName: eStoreData.siteName,
        dealIdentifier: eStoreData.dealIdentifier,
        exporterName: eStoreData.exporterName,
        buyerName: eStoreData.buyerName,
        facilityIdentifier: facilityIdentifier?.toString(),
        destinationMarket: eStoreData.destinationMarket,
        riskMarket: eStoreData.riskMarket,
      }),
    ),
  );

  console.info('Cron task: Uploading the supporting documents');
  const uploadDocuments = Promise.all(
    eStoreData.supportingInformation.map((file: any) =>
      uploadSupportingDocuments({
        siteName: eStoreData.siteName,
        dealIdentifier: eStoreData.dealIdentifier,
        buyerName: eStoreData.buyerName,
        ...file,
      }),
    ),
  );
  uploadDocuments.then((results) => console.info('Cron task: Supporting documents uploaded successfully', results));
  uploadDocuments.catch((e) => console.error('There was a problem uploading the documents', e));

  eStoreDealFolderManager.deleteJob(eStoreData.dealIdentifier);
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
  console.log(req.body);
  // @ts-ignore
  const eStoreData = req.body;

  if (eStoreData) {
    const { siteName, status } = await siteExists(eStoreData.exporterName);
    console.log({ siteName }, { status });
    // check if website already exists
    if (status === ESTORE_STATUS.CREATED) {
      // create the Buyer folder
      await createBuyerFolder({
        siteName: eStoreData.siteName,
        exporterName: eStoreData.exporterName,
        buyerName: eStoreData.buyerName,
      });

      // add a new job to the deal folder manager that runs very 35 seconds
      eStoreDealFolderManager.add(eStoreData.dealIdentifier, folderCreationTimer, () => {
        eStoreDealFolderCreationJob(eStoreData);
      });
    } else {
      // keep track of each new site creation jobs
      // we do this by adding a new item inside the `cron-job-logs` collection
      const collection = await getCollection('cron-job-logs');
      await collection.insertOne({
        cronType: 'SITE_CREATION',
        status: 'Running',
        timestamp: Date.now(),
        siteName,
        buyerName: eStoreData.buyerName,
        dealIdentifier: eStoreData.dealIdentifier,
        destinationMarket: eStoreData.destinationMarket,
        facilityIdentifiers: eStoreData.facilityIdentifiers,
        supportingInformation: eStoreData.supportingInformation,
      });

      // send a request to estore to start creating the eStore site
      await createExporterSite(siteName);
      // add a new job to the site creation manager queue that runs very 2 minutes and 15 seconds
      eStoreSiteManager.add(siteName, siteCreationTimer, () => {
        eStoreSiteCreationJob(siteName);
      });
    }

    return res.status(200);
  }
};
