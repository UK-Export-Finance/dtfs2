import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import CronJobManager from 'cron-job-manager';
import { getCollection } from '../../../database';

dotenv.config();
const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;
const username: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY;
const password: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET;

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

const siteExists = async ({ ...payload }: any) => {
  console.info('Checking if the Site exists', payload);
  const response = await postToEstore(`site/exist`, payload);
  return response;
};

// @ts-ignore
const createExporterSite = async (exporterName: any) => {
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
  const response = await siteExists(exporterName);
  console.log(response, response.siteName, response.status);
  let task;
  if (response.status === 'Created') {
    eStoreSiteManager.stop(response.siteName);
    const collection = await getCollection('cron-job-logs');
    task = await collection.findOneAndUpdate({ siteName: response.siteName, completionDate: Date.now() });
  }
  return task;
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
  const { exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket, facilityIdentifiers, supportingDocuments } = req.body;

  // const { siteName, status } = await siteExists(exporterName);
  // console.log(siteName, status);
  // // check if website already exists
  // if (status === 'Created') {
  //   // create the Buyer folder
  //   await createBuyerFolder({ siteName, exporterName, buyerName });

  //   // create the Deal folder
  //   await createDealFolder({ siteName, exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket });

  //   // create Facility folders
  //   await Promise.all(
  //     facilityIdentifiers.map((facilityIdentifier: any) =>
  //       createFacilityFolder({
  //         siteName,
  //         dealIdentifier,
  //         exporterName,
  //         buyerName,
  //         facilityIdentifier: facilityIdentifier?.toString(),
  //         destinationMarket,
  //         riskMarket,
  //       }),
  //     ),
  //   );

  //   const uploadDocuments = Promise.all(supportingDocuments.map((file: any) => uploadSupportingDocuments({ siteName, dealIdentifier, buyerName, ...file })));
  //   uploadDocuments.then((results) => console.info('Files uploaded', results));
  //   uploadDocuments.catch((e) => console.error('There was a problem uploading the documents', e));
  // } else {
  //   // start cron task
  //   const collection = await getCollection('cron-job-logs');
  //   await collection.insertOne({
  //     cronType: 'eStore site creation',
  //     status: 'Running',
  //     timestamp: Date.now(),
  //     siteName,
  //     buyerName,
  //     dealIdentifier,
  //     destinationMarket,
  //     facilityIdentifiers,
  //     supportingDocuments,
  //   });

  //   createExporterSite(siteName);
  //   // add a new site to the cron-job queue
  //   eStoreSiteManager.add(siteName, '5 * * * * *', () => {
  //     eStoreSiteCreationJob(siteName);
  //   });
  // }

  return res.status(200).send(exporterName);
};
