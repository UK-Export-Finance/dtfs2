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

// ensure that the `apiPayload` parameter has only these types
const postToEstore = async (
  apiEndpoint: string,
  apiPayload: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
  timeout = 0,
) => {
  const eStoreUrl: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_URL;
  const username: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_KEY;
  const password: any = process.env.MULESOFT_API_UKEF_ESTORE_EA_SECRET;
  console.info('Calling eStore endpoint ', apiEndpoint, apiPayload);

  const response = await axios({
    method: 'post',
    url: `${eStoreUrl}/${apiEndpoint}`,
    auth: { username, password },
    headers: { 'Content-Type': 'application/json' },
    data: apiPayload,
    timeout,
  }).catch(async (error: any) => {
    console.error(`Error calling eStore API %O`, { apiEndpoint, data: error?.response?.data, status: error?.response?.status });
    const tfmUserCollection = await getCollection('tfm-users');
    const tfmDevUser = await tfmUserCollection.aggregate([{ $match: { hasEstoreAccess: true } }, { $project: { _id: 0, email: 1 } }]).toArray();

    if (tfmDevUser.length && error?.response?.status !== 404) {
      const data = {
        apiEndpoint,
        apiPayload,
        apiResponse: { data: error?.response?.data, status: error?.response?.status },
      };
      // send an email to the ESTORE team to indicate that one of the eStore endpoints has failed
      tfmDevUser.map((item: any) => sendEmail(EMAIL_TEMPLATES.ESTORE_FAILED, item.email, data));
    }

    return { data: error?.response?.data || {}, status: error?.response?.status || {} };
  });

  return { data: response.data, status: response.status };
};

export const siteExists = async (exporterName: EstoreSite): Promise<SiteExistsResponse> => {
  const timeout = 1000 * 30; // 30 seconds timeout to handle long timeouts
  const response = await postToEstore(`site/exist`, [exporterName], timeout);
  return response;
};

export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore('site', [exporterName], timeout);
  return response;
};

export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`term/facility`, facilityId, timeout);
  return response;
};

export const createBuyerFolder = async (siteName: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`site/${siteName}/buyer`, [buyerName], timeout);
  return response;
};
export const createDealFolder = async (siteName: string, data: EstoreDealFolder): Promise<DealFolderResponse> => {
  const timeout = 1000 * 120; // 120 seconds timeout to handle long timeouts
  const response = await postToEstore(`site/${siteName}/deal`, [data], timeout);
  return response;
};
export const createFacilityFolder = async (siteName: string, dealIdentifier: string, data: EstoreFacilityFolder): Promise<FacilityFolderResponse> => {
  const timeout = 1000 * 120; // 120 seconds timeout to handle long timeouts
  const response = await postToEstore(`site/${siteName}/deal/${dealIdentifier}/facility`, [data], timeout);
  return response;
};

export const uploadSupportingDocuments = async (
  siteName: string,
  dealIdentifier: string,
  buyerName: string,
  file: EstoreDealFiles,
): Promise<UploadDocumentsResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`site/${siteName}/deal/${dealIdentifier}/documents?buyerName=${buyerName}`, [file], timeout);
  return response;
};
