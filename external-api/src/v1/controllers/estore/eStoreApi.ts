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

import { EMAIL_TEMPLATES, ESTORE_CRON_STATUS } from '../../../constants';
import { isValidExporterName, isValidSiteId } from '../../../utils/inputValidations';
import { validUkefId } from '../../../utils/validUkefId';

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
    console.error('Error calling eStore API %O', { apiEndpoint, data: error?.response?.data, status: error?.response?.status });
    const tfmUserCollection = await getCollection('tfm-users');
    const tfmDevUser = await tfmUserCollection.aggregate([{ $match: { hasEstoreAccess: { $eq: true } } }, { $project: { _id: false, email: true } }]).toArray();

    if (tfmDevUser.length && error?.response?.status !== 404) {
      const payload = {
        apiEndpoint,
        data,
        apiResponse: { data: error?.response?.data, status: error?.response?.status },
      };
      // send an email to the ESTORE team to indicate that one of the eStore endpoints has failed
      tfmDevUser.map((item: any) => sendEmail(EMAIL_TEMPLATES.ESTORE_FAILED, item.email, payload));
    }

    return { data: 'Failed to call eStore API', status: error?.response?.status || {} };
  });

  return { data: response.data, status: response.status };
};

export const siteExists = async (exporterName: string): Promise<SiteExistsResponse> => {
  if (!isValidExporterName(exporterName)) {
    console.error('Unable check site exists due to invalid exporter name: %s', exporterName);
    return { data: { status: ESTORE_CRON_STATUS.FAILED, siteId: '' }, status: 400 };
  }
  console.info('Checking if a site exists for exporter %s', exporterName);
  if (exporterName) {
    const response = await axios({
      method: 'get',
      url: `${APIM_ESTORE_URL}/sites?exporterName=${exporterName}`,
      headers,
    }).catch((error: any) => {
      console.error('Unable to check if the site exists %O', { data: error?.response?.data, status: error?.response?.status });
      return { data: { status: ESTORE_CRON_STATUS.FAILED, siteId: '' }, status: error?.response?.status || 500 };
    });
    return response;
  }
  return { data: { status: ESTORE_CRON_STATUS.FAILED, siteId: '' }, status: 400 };
};

export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore('sites', [exporterName], timeout);
  return response;
};

export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse> => {
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore('terms/facilities', [facilityId], timeout);
  return response;
};

export const createBuyerFolder = async (siteId: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Unable to create buyer folder due to invalid siteId: %s', siteId);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/buyers`, [buyerName], timeout);
  return response;
};
export const createDealFolder = async (siteId: string, data: EstoreDealFolder): Promise<DealFolderResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Unable to create deal folder due to invalid siteId: %s', siteId);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }
  const timeout = 1000 * 120; // 120 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/deals`, [data], timeout);
  return response;
};
export const createFacilityFolder = async (siteId: string, dealIdentifier: string, data: EstoreFacilityFolder): Promise<FacilityFolderResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Unable to create facility folder due to invalid siteId or dealIdentifier: %s, %s', siteId, dealIdentifier);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }
  const timeout = 1000 * 120; // 120 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/deals/${dealIdentifier}/facilities`, [data], timeout);
  return response;
};

export const uploadSupportingDocuments = async (siteId: string, dealIdentifier: string, file: EstoreDealFiles): Promise<UploadDocumentsResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Unable to upload the supporting documents due to invalid siteId or dealIdentifier: %s, %s', siteId, dealIdentifier);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }
  const timeout = 1000 * 50; // 50 seconds timeout to handle long timeouts
  const response = await postToEstore(`sites/${siteId}/deals/${dealIdentifier}/documents`, [file], timeout);
  return response;
};
