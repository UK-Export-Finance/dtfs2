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
import { validUkefId, isValidExporterName, isValidSiteId } from '../../../helpers';

dotenv.config();

const oneMinute = 1000 * 60; // 60 seconds timeout to handle medium timeouts
const twoMinutes = 1000 * 120; // 120 seconds timeout to handle long timeouts

const { APIM_ESTORE_URL, APIM_ESTORE_KEY, APIM_ESTORE_VALUE } = process.env;
const headers = {
  'Content-Type': 'application/json',
  [String(APIM_ESTORE_KEY)]: APIM_ESTORE_VALUE,
};

/**
 * Ascertain whether the site exists in the eStore or not,
 * for the provided exporter.
 * @param exporterName - The name of the exporter to check against.
 * @returns A promise that resolves to the response object containing the status and siteId of the site.
 * @example
 * const exporterName = "ABC Exporter";
 * const response = await siteExists(exporterName);
 * console.log(response);
 * // Output: { status: 200, data: { status: "Completed", siteId: "12345" } }
 */
export const siteExists = async (exporterName: string): Promise<SiteExistsResponse> => {
  if (!exporterName || !isValidExporterName(exporterName)) {
    console.error('Void exporter name provided %s', exporterName);

    return {
      status: 400,
      data: {
        status: ESTORE_CRON_STATUS.FAILED,
        siteId: '',
      },
    };
  }

  const response = await axios({
    method: 'get',
    url: `${APIM_ESTORE_URL}/sites?exporterName=${exporterName}`,
    headers,
  }).catch((error: any) => {
    console.error('eStore site exist check failed: %O', { data: error?.response?.data, status: error?.response?.status });

    return {
      status: error?.response?.status || 500,
      data: {
        status: ESTORE_CRON_STATUS.FAILED,
        siteId: '',
      },
    };
  });

  return response;
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

export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse> => postToEstore('sites', [exporterName], oneMinute);

export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse> =>
  postToEstore(`terms/facilities`, [facilityId], oneMinute);

export const createBuyerFolder = async (siteId: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Unable to create buyer folder due to invalid siteId: %s', siteId);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }

  return postToEstore(`sites/${siteId}/buyers`, [buyerName], oneMinute);
};
export const createDealFolder = async (siteId: string, data: EstoreDealFolder): Promise<DealFolderResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Unable to create deal folder due to invalid siteId: %s', siteId);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }
  return postToEstore(`sites/${siteId}/deals`, [data], twoMinutes);
};
export const createFacilityFolder = async (siteId: string, dealIdentifier: string, data: EstoreFacilityFolder): Promise<FacilityFolderResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Unable to create facility folder due to invalid siteId or dealIdentifier: %s, %s', siteId, dealIdentifier);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }

  return postToEstore(`sites/${siteId}/deals/${dealIdentifier}/facilities`, [data], twoMinutes);
};

export const uploadSupportingDocuments = async (siteId: string, dealIdentifier: string, file: EstoreDealFiles): Promise<UploadDocumentsResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Unable to upload the supporting documents due to invalid siteId or dealIdentifier: %s, %s', siteId, dealIdentifier);
    return { data: { error: ESTORE_CRON_STATUS.FAILED }, status: 400 };
  }

  return postToEstore(`sites/${siteId}/deals/${dealIdentifier}/documents`, [file], oneMinute);
};
