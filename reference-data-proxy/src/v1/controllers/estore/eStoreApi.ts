import axios from 'axios';
import dotenv from 'dotenv';
import { Estore, EstoreSite, EstoreBuyer, EstoreDealFolder, EstoreFacilityFolder, EstoreDealFiles, EstoreTermStore } from '../../../interfaces';

dotenv.config();
const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;
const username: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY;
const password: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET;

// ensure that the `data` parameter has only these types
const postToEstore = async (
  apiEndpoint: string,
  data: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
) => {
  if (!eStoreUrl) {
    return false;
  }

  console.info('Calling eStore endpoint ', apiEndpoint, data);

  const response = await axios({
    method: 'post',
    url: `${eStoreUrl}/${apiEndpoint}`,
    auth: { username, password },
    headers: { 'Content-Type': 'application/json' },
    data,
    timeout: 1000 * 50, // 20 seconds timeout to handle long timeouts
  }).catch((error: any) => {
    console.error(`Error calling eStore API (/${apiEndpoint}): ${error?.response?.status} \n`, { error });
    return error.response.data;
  });

  return response;
};

export const siteExists = async (exporterName: EstoreSite) => {
  const response = await postToEstore(`site/exist`, [exporterName]);
  return response;
};

export const createExporterSite = async (exporterName: EstoreSite) => {
  const response = await postToEstore('site', [exporterName]);
  return response;
};

export const addFacilityToTermStore = async (facilityId: EstoreTermStore) => {
  const response = await postToEstore(`term/facility`, facilityId);
  return response;
};

export const createBuyerFolder = async (siteName: string, buyerName: EstoreBuyer) => {
  const response = await postToEstore(`site/${siteName}/buyer`, [buyerName]);
  return response;
};
export const createDealFolder = async (siteName: string, data: EstoreDealFolder) => {
  const response = await postToEstore(`site/${siteName}/deal`, [data]);
  return response;
};
export const createFacilityFolder = async (siteName: string, dealIdentifier: string, data: EstoreFacilityFolder) => {
  const response = await postToEstore(`site/${siteName}/deal/${dealIdentifier}/facility`, [data]);
  return response;
};

export const uploadSupportingDocuments = async (siteName: string, dealIdentifier: string, buyerName: string, file: EstoreDealFiles) => {
  const response = await postToEstore(`site/${siteName}/deal/${dealIdentifier}/documents?buyerName=${buyerName}`, [file]);
  return response;
};
