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
  EstoreErrorResponse,
} from '../../../interfaces';
import { sendEmail } from '../email.controller';
import { EMAIL_TEMPLATES, ESTORE_CRON_STATUS, ENDPOINT } from '../../../constants';
import { validUkefId, isValidExporterName, isValidSiteId } from '../../../helpers';

dotenv.config();

const { HttpStatusCode } = axios;
const oneMinute = 1000 * 60; // 60 seconds timeout to handle medium timeouts
const twoMinutes = 1000 * 120; // 120 seconds timeout to handle long timeouts

const { APIM_ESTORE_URL, APIM_ESTORE_KEY, APIM_ESTORE_VALUE, UKEF_INTERNAL_NOTIFICATION } = process.env;
const headers = {
  'Content-Type': 'application/json',
  [String(APIM_ESTORE_KEY)]: APIM_ESTORE_VALUE,
};

/**
 * Checks if a site exists in the eStore system for the given exporter name.
 * @param exporterName - The name of the exporter for which the site existence needs to be checked.
 * @returns A promise that resolves to a response indicating whether the site exists or not.
 */
export const siteExists = async (exporterName: string): Promise<SiteExistsResponse | EstoreErrorResponse> => {
  try {
    // Check if exporterName is provided and valid
    if (!exporterName || !isValidExporterName(exporterName)) {
      console.error('❌ Invalid exporter name provided %s', exporterName);

      return {
        status: 400,
        data: {
          status: ESTORE_CRON_STATUS.FAILED,
          siteId: '',
        },
      };
    }

    // Make a GET request to the eStore API to check if a site exists
    const response = await axios.get(`${APIM_ESTORE_URL}sites?exporterName=${exporterName}`, { headers });

    if (!response) {
      throw new Error('❌ Invalid site exist response received');
    }

    return response;
  } catch (error: any) {
    console.error('❌ eStore site exist check failed %O', { data: error?.response?.data, status: error?.response?.status });

    return {
      status: HttpStatusCode.InternalServerError,
      error,
    };
  }
};

/**
 * Sends a POST request to an eStore endpoint.
 * @param endpoint - The URL endpoint to send the POST request to.
 * @param data - The payload data to send in the request.
 * @param timeout - The timeout value for the request in milliseconds. Default is 0.
 * @returns A Promise that resolves to an object with the response data and status if successful,
 * or an error object with the status code and error details if there is an error.
 */
const postToEstore = async (
  endpoint: string,
  data: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
  timeout = 0,
): Promise<any | EstoreErrorResponse> => {
  try {
    console.info('Invoking eStore endpoint %s with payload %s', endpoint, data);
    const response = await axios.post(`${APIM_ESTORE_URL}${endpoint}`, data, { headers, timeout });

    if (!response) {
      throw new Error('❌ Invalid post to estore response received');
    }

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    console.error('❌ Error calling eStore endpoint %s %o, email has been dispatched.', endpoint, error);
    sendEmail(EMAIL_TEMPLATES.ESTORE_FAILED, String(UKEF_INTERNAL_NOTIFICATION), data);

    return {
      status: HttpStatusCode.InternalServerError,
      error,
    };
  }
};

/**
 * Creates a Sharepoint site, where all directories and files and uploaded.
 * @param exporterName - An object of type EstoreSite that contains the exporter name.
 * @returns A Promise that resolves to a SiteCreationResponse object.
 */
export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse | EstoreErrorResponse> =>
  postToEstore(ENDPOINT.SITE, [exporterName], oneMinute);

/**
 * Adds a facility to the term store.
 * @param facilityId - An object of type EstoreTermStore that contains the facility ID.
 * @returns A Promise that resolves to a TermStoreResponse object.
 */
export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse | EstoreErrorResponse> =>
  postToEstore(ENDPOINT.TERM, [facilityId], oneMinute);

/**
 * Creates a buyer directory on Sharepoint.
 *
 * @param siteId - The ID of the site where the directory should be created.
 * @param buyerName - An object containing the buyer's name and other properties.
 * @returns A Promise that resolves to a BuyerFolderResponse object containing the response data and status.
 */
export const createBuyerFolder = async (siteId: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse | EstoreErrorResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Invalid site ID %s', siteId);

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
export const createDealFolder = async (siteId: string, data: EstoreDealFolder): Promise<DealFolderResponse | EstoreErrorResponse> => {
  if (!isValidSiteId(siteId)) {
    console.error('Invalid site ID %s', siteId);

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
export const createFacilityFolder = async (
  siteId: string,
  dealIdentifier: string,
  data: EstoreFacilityFolder,
): Promise<FacilityFolderResponse | EstoreErrorResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Invalid site or deal ID %s %s', siteId, dealIdentifier);

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
export const uploadSupportingDocuments = async (
  siteId: string,
  dealIdentifier: string,
  file: EstoreDealFiles,
): Promise<UploadDocumentsResponse | EstoreErrorResponse> => {
  if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
    console.error('Invalid site or deal ID %s %s', siteId, dealIdentifier);

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
