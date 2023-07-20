import axios from 'axios';
import dotenv from 'dotenv';
import {
  Estore,
  EstoreSite,
  EstoreBuyer,
  EstoreDealFolder,
  EstoreFacilityFolder,
  EstoreDealFiles,
  EstoreTermStore,
  SiteCreationResponse,
  SiteExistsResponse,
  BuyerFolderResponse,
  DealFolderResponse,
  FacilityFolderResponse,
  UploadDocumentsResponse,
  TermStoreResponse,
} from '../../../interfaces';
import { sendEmail } from '../email.controller';
import { getCollection } from '../../../database';

import { EMAIL_TEMPLATES } from '../../../constants';

dotenv.config();
const { APIM_ESTORE_URL, APIM_ESTORE_KEY, APIM_ESTORE_VALUE } = process.env;

const headers = {
  'Content-Type': 'application/json',
  [String(APIM_ESTORE_KEY)]: APIM_ESTORE_VALUE,
};

// ensure that the `data` parameter has only these types
const postToEstore = async (
  apiEndpoint: string,
  data: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
  timeout = 0,
) => {
  console.info('Calling eStore endpoint %s %O', apiEndpoint, data);

  const response = await axios({
    method: 'post',
    url: `${APIM_ESTORE_URL}/${apiEndpoint}`,
    headers,
    data,
    timeout,
  }).catch(async (error: any) => {
    console.error(`Error calling eStore API %O`, { apiEndpoint, data: error?.response?.data, status: error?.response?.status });
    const tfmUserCollection = await getCollection('tfm-users');
    const tfmDevUser = await tfmUserCollection.aggregate([{ $match: { hasEstoreAccess: true } }, { $project: { _id: 0, email: 1 } }]).toArray();

    if (tfmDevUser.length && error?.response?.status !== 404) {
      const payload = {
        apiEndpoint,
        data,
        apiResponse: { data: error?.response?.data, status: error?.response?.status },
      };
      // send an email to the ESTORE team to indicate that one of the eStore endpoints has failed
      tfmDevUser.map((item: any) => sendEmail(EMAIL_TEMPLATES.ESTORE_FAILED, item.email, payload));
    }

    return { data: error?.response?.data || {}, status: error?.response?.status || {} };
  });

  return { data: response.data, status: response.status };
};

export const siteExists = async (exporterName: string): Promise<SiteExistsResponse> => {
  console.info('Checking if a site exists for exporter %s', exporterName);
  const response = await axios({
    method: 'get',
    url: `${APIM_ESTORE_URL}/sites?exporterName=${exporterName}`,
    headers,
  }).catch((error: any) => {
    return { data: error?.response?.data || {}, status: error?.response?.status || {} };
  });

  return response;
};

export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore('sites', [exporterName], timeout);
  return response;
};

export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`terms/facilities`, [facilityId], timeout);
  return response;
};

export const createBuyerFolder = async (siteId: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/buyers`, [buyerName], timeout);
  return response;
};
export const createDealFolder = async (siteId: string, data: EstoreDealFolder): Promise<DealFolderResponse> => {
  const timeout = 1000 * 120; // 120 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/deals`, [data], timeout);
  return response;
};
export const createFacilityFolder = async (siteId: string, dealIdentifier: string, data: EstoreFacilityFolder): Promise<FacilityFolderResponse> => {
  const timeout = 1000 * 120; // 120 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/deals/${dealIdentifier}/facilities`, [data], timeout);
  return response;
};

export const uploadSupportingDocuments = async (
  siteId: string,
  dealIdentifier: string,
  buyerName: string,
  file: EstoreDealFiles,
): Promise<UploadDocumentsResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/deals/${dealIdentifier}/documents?buyerName=${buyerName}`, [file], timeout);
  return response;
};
