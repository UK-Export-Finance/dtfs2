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
  EstoreResponse,
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
import { estoreInternalServerError } from '../../../helpers/errors/estore-internal-server-error';

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
 * Checks if a site exists in eStore for a given exporter name.
 *
 * @param {string} exporterName - The name of the exporter.
 * @returns {Promise<SiteExistsResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const siteExists = async (exporterName: string): Promise<SiteExistsResponse | EstoreErrorResponse> => {
  try {
    // Check if exporterName is provided and valid
    if (!exporterName || !isValidExporterName(exporterName)) {
      console.error('❌ Invalid exporter name provided %s', exporterName);

      return {
        status: HttpStatusCode.BadRequest,
        data: {
          status: ESTORE_CRON_STATUS.FAILED,
          siteId: '',
        },
      };
    }

    // Make a GET request to the eStore API to check if a site exists
    const response = await axios.get(`${APIM_ESTORE_URL}/sites?exporterName=${exporterName}`, { headers }).catch((error: any) => error);

    if (!response) {
      throw new Error('❌ Invalid site exist response received');
    }

    let statusCode: number = 0;
    let status: string = '';
    let siteId: string = '';

    /**
     * `404` response is returned inside `response`
     * object if the site does not exist.
     * @example response: { "message": "Not found", "statusCode": 404 }
     */
    if (response.response) {
      statusCode = response.response?.data?.statusCode;
      status = response.response?.data?.message;
      siteId = '';
    }

    /**
     * If not `404` response is returned inside
     * `data` object.
     * @example data: { "siteId": "1234567", "status": "Provisioning",  }
     * @example data: { "siteId": "1234567", "status": "Created" }
     */
    if (response.data) {
      statusCode = response.status;
      status = response.data.status;
      siteId = response.data.siteId;
    }

    return {
      status: statusCode,
      data: {
        status,
        siteId,
      },
    };
  } catch (error: any) {
    console.error('❌ eStore site exist check failed %O', error?.response?.data);
    return estoreInternalServerError(error);
  }
};

/**
 * Makes a POST request to the eStore API.
 *
 * @param {string} endpoint - The endpoint to call.
 * @param {Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[]}
 * data - The data to send in the request.
 * @param {number} timeout - The timeout for the request.
 * @returns {Promise<EstoreResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
const postToEstore = async (
  endpoint: string,
  data: Estore | EstoreSite[] | EstoreBuyer[] | EstoreTermStore[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDealFiles[],
  timeout = 0,
): Promise<EstoreResponse | EstoreErrorResponse> => {
  try {
    console.info('Invoking eStore endpoint %s with payload %o', endpoint, data);
    const response = await axios.post(`${APIM_ESTORE_URL}${endpoint}`, data, { headers, timeout }).catch((error: any) => error);

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
    return estoreInternalServerError(error);
  }
};

/**
 * Creates a site in eStore for a given exporter name.
 *
 * @param {EstoreSite} exporterName - The name of the exporter.
 * @returns {Promise<SiteCreationResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const createExporterSite = async (exporterName: EstoreSite): Promise<SiteCreationResponse | EstoreErrorResponse> => {
  try {
    const response = await postToEstore(ENDPOINT.SITE, [exporterName], oneMinute);

    if (!response) {
      throw new Error('❌ Invalid response received');
    }

    return response;
  } catch (error: any) {
    console.error('❌ eStore create exporter site has failed %O', { data: error?.response?.data, status: error?.response?.status });
    return estoreInternalServerError(error);
  }
};

/**
 * Adds a facility to the term store in eStore.
 *
 * @param {EstoreTermStore} facilityId - The ID of the facility to add to the term store.
 * @returns {Promise<TermStoreResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const addFacilityToTermStore = async (facilityId: EstoreTermStore): Promise<TermStoreResponse | EstoreErrorResponse> => {
  try {
    const response = await postToEstore(ENDPOINT.TERM, [facilityId], oneMinute);

    if (!response) {
      throw new Error('❌ Invalid response received');
    }

    return response;
  } catch (error: any) {
    console.error('❌ eStore adding facility term has failed %O', { data: error?.response?.data, status: error?.response?.status });
    return estoreInternalServerError(error);
  }
};

/**
 * Creates a buyer folder in eStore for a given site ID.
 *
 * @param {string} siteId - The ID of the site where the buyer folder will be created.
 * @param {EstoreBuyer} buyerName - The name of the buyer.
 * @returns {Promise<BuyerFolderResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const createBuyerFolder = async (siteId: string, buyerName: EstoreBuyer): Promise<BuyerFolderResponse | EstoreErrorResponse> => {
  try {
    if (!isValidSiteId(siteId)) {
      console.error('Invalid site ID %s', siteId);
      throw new Error('Invalid site ID');
    }

    const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.BUYER}`;
    return postToEstore(endpoint, [buyerName], oneMinute);
  } catch (error: any) {
    console.error('❌ eStore create buyer folder request has failed %O', { data: error?.response?.data, status: error?.response?.status });
    return estoreInternalServerError(error);
  }
};

/**
 * Creates a deal folder in eStore for a given site ID.
 *
 * @param {string} siteId - The ID of the site where the deal folder will be created.
 * @param {EstoreDealFolder} data - The deal folder data.
 * @returns {Promise<DealFolderResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const createDealFolder = async (siteId: string, data: EstoreDealFolder): Promise<DealFolderResponse | EstoreErrorResponse> => {
  try {
    if (!isValidSiteId(siteId)) {
      console.error('Invalid site ID %s', siteId);
      throw new Error('Invalid site ID');
    }

    const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}`;
    return postToEstore(endpoint, [data], twoMinutes);
  } catch (error: any) {
    console.error('❌ eStore create deal folder request has failed %O', { data: error?.response?.data, status: error?.response?.status });
    return estoreInternalServerError(error);
  }
};

/**
 * Creates a facility folder in eStore for a given site ID and deal identifier.
 *
 * @param {string} siteId - The ID of the site where the facility folder will be created.
 * @param {string} dealIdentifier - The identifier of the deal.
 * @param {EstoreFacilityFolder} data - The facility folder data.
 * @returns {Promise<FacilityFolderResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const createFacilityFolder = async (
  siteId: string,
  dealIdentifier: string,
  data: EstoreFacilityFolder,
): Promise<FacilityFolderResponse | EstoreErrorResponse> => {
  try {
    if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
      console.error('Invalid site or deal ID %s %s', siteId, dealIdentifier);
      throw new Error('Invalid site or deal ID');
    }

    const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}/${dealIdentifier}/${ENDPOINT.FACILITY}`;
    return postToEstore(endpoint, [data], twoMinutes);
  } catch (error: any) {
    console.error('❌ eStore create facility folder request has failed %O', { data: error?.response?.data, status: error?.response?.status });
    return estoreInternalServerError(error);
  }
};

/**
 * Uploads supporting documents to eStore for a given site ID and deal identifier.
 *
 * @param {string} siteId - The ID of the site where the documents will be uploaded.
 * @param {string} dealIdentifier - The identifier of the deal.
 * @param {EstoreDealFiles} file - The file to upload.
 * @returns {Promise<UploadDocumentsResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const uploadSupportingDocuments = async (
  siteId: string,
  dealIdentifier: string,
  file: EstoreDealFiles,
): Promise<UploadDocumentsResponse | EstoreErrorResponse> => {
  try {
    if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
      console.error('Invalid site or deal ID %s %s', siteId, dealIdentifier);
      throw new Error('Invalid site or deal ID');
    }

    const endpoint = `${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}/${dealIdentifier}/${ENDPOINT.DOCUMENT}`;
    return postToEstore(endpoint, [file], oneMinute);
  } catch (error: any) {
    console.error('❌ eStore uploading document has failed %O', { data: error?.response?.data, status: error?.response?.status });
    return estoreInternalServerError(error);
  }
};
