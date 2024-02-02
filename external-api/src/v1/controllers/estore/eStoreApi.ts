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
import { EMAIL_TEMPLATES, ESTORE_CRON_STATUS, ENDPOINT } from '../../../constants';
import { validUkefId, isValidExporterName, isValidSiteId } from '../../../helpers';

dotenv.config();

const oneMinute = 1000 * 60; // 60 seconds timeout to handle medium timeouts
const twoMinutes = 1000 * 120; // 120 seconds timeout to handle long timeouts

const { APIM_ESTORE_URL, APIM_ESTORE_KEY, APIM_ESTORE_VALUE, UKEF_INTERNAL_NOTIFICATION } = process.env;
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
    url: `${APIM_ESTORE_URL}sites?exporterName=${exporterName}`,
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

/**
 * Sends a POST request to an eStore endpoint using the axios library.
 * @param {string} endpoint - The eStore API endpoint to send the request to.
 * @param {Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[]} data
 * The payload data to send with the request.
 * @param {number} [timeout=0] - The timeout value for the request in milliseconds. Defaults to 0 (no timeout).
 * @returns {Promise<{ data: any, status: number }>} The response data and status from the eStore API.
 * @throws {Error} If an error occurs during the request.
 */
const postToEstore = async (
  endpoint: string,
  data: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
  timeout = 0,
) => {
  console.info('Invoking eStore endpoint %s with payload %s', endpoint, data);

  const response = await axios({
    method: 'POST',
    url: `${APIM_ESTORE_URL}${endpoint}`,
    headers,
    data,
    timeout,
  }).catch(async (error: any) => {
    console.error(`Error calling eStore endpoint %s %O`, endpoint, {
      data: error?.response?.data,
      status: error?.response?.status,
    });

    sendEmail(EMAIL_TEMPLATES.ESTORE_FAILED, String(UKEF_INTERNAL_NOTIFICATION), data);

    return {
      data: 'Error calling eStore endpoint',
      status: error?.response?.status || {},
    };
  });

  return { data: response.data, status: response.status };
};

/**
 * Creates a Sharepoint site, where all directories and files and uploaded.
 * @param exporterName - An object of type EstoreSite that contains the exporter name.
 * @returns A Promise that resolves to a SiteCreationResponse object.
 */
export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse> => postToEstore(ENDPOINT.SITE, [exporterName], oneMinute);

/**
 * Adds a facility to the term store.
 * @param facilityId - An object of type EstoreTermStore that contains the facility ID.
 * @returns A Promise that resolves to a TermStoreResponse object.
 */
export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse> => postToEstore(ENDPOINT.TERM, [facilityId], oneMinute);

/**
 * Creates a buyer directory on Sharepoint.
 *
 * @param siteId - The ID of the site where the directory should be created.
 * @param buyerName - An object containing the buyer's name and other properties.
 * @returns A Promise that resolves to a BuyerFolderResponse object containing the response data and status.
 */
export const createBuyerFolder = async (siteId: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Void site ID %s', siteId);

    return {
      data: {
        error: ESTORE_CRON_STATUS.FAILED,
      },
      status: 400,
    };
  }

  const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.BUYER}`;
  return postToEstore(endpoint, [buyerName], oneMinute);
};

/**
 * Creates a deal directory on Sharepoint.
 *
 * @param siteId - The ID of the site where the directory should be created.
 * @param data - An object containing the necessary data for creating the directory.
 * @returns A Promise that resolves to a DealFolderResponse object containing the response data and status.
 */
export const createDealFolder = async (siteId: string, data: EstoreDealFolder): Promise<DealFolderResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Void site ID %s', siteId);

    return {
      data: {
        error: ESTORE_CRON_STATUS.FAILED,
      },
      status: 400,
    };
  }

  const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}`;
  return postToEstore(endpoint, [data], twoMinutes);
};

/**
 * Creates a facility directory on Sharepoint.
 *
 * @param siteId - The ID of the site where the directory should be created.
 * @param dealIdentifier - The identifier of the deal associated with the directory.
 * @param data - An object containing the necessary data for creating the directory.
 * @returns A Promise that resolves to a FacilityFolderResponse object containing the response data and status.
 */
export const createFacilityFolder = async (siteId: string, dealIdentifier: string, data: EstoreFacilityFolder): Promise<FacilityFolderResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Void site or deal ID %s %s', siteId, dealIdentifier);

    return {
      data: {
        error: ESTORE_CRON_STATUS.FAILED,
      },
      status: 400,
    };
  }

  const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}/${dealIdentifier}/${ENDPOINT.FACILITY}`;
  return postToEstore(endpoint, [data], twoMinutes);
};

/**
 * Uploads supporting documents to Sharepoint.
 *
 * @param siteId - The ID of the site where the documents should be uploaded.
 * @param dealIdentifier - The identifier of the deal associated with the documents.
 * @param file - An object containing the details of the document to be uploaded.
 * @returns A Promise that resolves to an UploadDocumentsResponse object containing the response data and status.
 */
export const uploadSupportingDocuments = async (siteId: string, dealIdentifier: string, file: EstoreDealFiles): Promise<UploadDocumentsResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Void site or deal ID %s %s', siteId, dealIdentifier);

    return {
      data: {
        error: ESTORE_CRON_STATUS.FAILED,
      },
      status: 400,
    };
  }

  const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}/${dealIdentifier}/${ENDPOINT.DOCUMENT}`;
  return postToEstore(endpoint, [file], oneMinute);
};
