import { get, post, HttpStatusCode } from 'axios';
import dotenv from 'dotenv';
import { HEADERS, customValidateStatus } from '@ukef/dtfs2-common';
import {
  Estore,
  EstoreSite,
  EstoreBuyer,
  EstoreDealFolder,
  EstoreFacilityFolder,
  EstoreDocument,
  EstoreTermStore,
  EstoreResponse,
  SiteCreationResponse,
  SiteExistsResponse,
  BuyerFolderResponse,
  DealFolderResponse,
  FacilityFolderResponse,
  DocumentCreationResponse,
  TermStoreResponse,
  EstoreErrorResponse,
} from '../../../interfaces';
import { ESTORE_CRON_STATUS, ENDPOINT } from '../../../constants';
import { validUkefId, isValidExporterName, isValidSiteId } from '../../../helpers';
import { estoreInternalServerError } from '../../../helpers/errors/estore-internal-server-error';

dotenv.config();

const oneMinute = 1000 * 60; // 60 seconds timeout to handle medium timeouts
const twoMinutes = 1000 * 120; // 120 seconds timeout to handle long timeouts

const { APIM_ESTORE_URL, APIM_ESTORE_KEY, APIM_ESTORE_VALUE } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
    const response: SiteExistsResponse = await get(`${APIM_ESTORE_URL}v1//sites?exporterName=${exporterName}`, {
      validateStatus(status) {
        return customValidateStatus(status);
      },
      headers,
    });

    if (!response) {
      throw new Error('❌ Invalid site exist response received');
    }

    let statusCode: number = 0;
    let status: string = '';
    let siteId: string = '';

    /**
     * `404` response is returned inside `data.message`
     * object if the site does not exist.
     * @example response: { "message": "Not found", "statusCode": 404 }
     */
    if (response?.data?.message) {
      statusCode = response?.status;
      status = response?.data?.message;
      siteId = '';
    }

    /**
     * If not `404`, response is returned inside
     * `data.siteId` object.
     * @example data: { "siteId": "1234567", "status": "Provisioning",  }
     * @example data: { "siteId": "1234567", "status": "Created" }
     */
    if (response?.data?.siteId) {
      statusCode = response?.status;
      status = response?.data?.status;
      siteId = response?.data?.siteId;
    }

    return {
      status: statusCode,
      data: {
        status,
        siteId,
      },
    };
  } catch (error: unknown) {
    console.error('❌ eStore site exist check failed %o', error);
    return estoreInternalServerError(error);
  }
};

/**
 * Makes a POST request to the eStore API.
 *
 * @param {string} endpoint - The endpoint to call.
 * @param {Estore | EstoreSite[] | EstoreTermStore[] | EstoreBuyer[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDocument[]}
 * data - The data to send in the request.
 * @param {number} timeout - The timeout for the request.
 * @returns {Promise<EstoreResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
const postToEstore = async (
  endpoint: string,
  data: Estore | EstoreSite[] | EstoreTermStore[] | EstoreBuyer[] | EstoreDealFolder | EstoreFacilityFolder[] | EstoreDocument[],
  timeout = 0,
): Promise<EstoreResponse | EstoreErrorResponse> => {
  try {
    console.info('Invoking eStore endpoint %s with payload %o', endpoint, data);
    const response: EstoreResponse = await post(`${APIM_ESTORE_URL}${endpoint}`, data, {
      validateStatus(status) {
        return customValidateStatus(status);
      },
      headers,
      timeout,
    });

    if (!response) {
      throw new Error('❌ Invalid post to estore response received');
    }

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('❌ Error calling eStore endpoint %s %o', endpoint, error);
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
    const response: EstoreResponse = await postToEstore(`v1/${ENDPOINT.SITE}`, [exporterName], oneMinute);

    if (!response) {
      throw new Error('❌ Invalid response received');
    }

    return response;
  } catch (error: unknown) {
    console.error('❌ eStore create exporter site has failed %o', error);
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
    const response: EstoreResponse = await postToEstore(`v1/${ENDPOINT.TERM}`, [facilityId], oneMinute);

    if (!response) {
      throw new Error('❌ Invalid response received');
    }

    return response;
  } catch (error: unknown) {
    console.error('❌ eStore adding facility term has failed %o', error);
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

    const endpoint = `v1/${ENDPOINT.SITE}/${siteId}/${ENDPOINT.BUYER}`;
    return postToEstore(endpoint, [buyerName], oneMinute);
  } catch (error: unknown) {
    console.error('❌ eStore create buyer folder request has failed %o', error);
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

    const endpoint = `v1/${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}`;
    return postToEstore(endpoint, [data], twoMinutes);
  } catch (error: unknown) {
    console.error('❌ eStore create deal folder request has failed %o', error);
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

    const endpoint = `v1/${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}/${dealIdentifier}/${ENDPOINT.FACILITY}`;
    return postToEstore(endpoint, [data], twoMinutes);
  } catch (error: unknown) {
    console.error('❌ eStore create facility folder request has failed %o', error);
    return estoreInternalServerError(error);
  }
};

/**
 * Uploads supporting documents to eStore for a given site ID and deal identifier.
 *
 * @param {string} siteId - The ID of the site where the documents will be uploaded.
 * @param {string} dealIdentifier - The identifier of the deal.
 * @param {EstoreDocument} file - The file to upload.
 * @returns {Promise<UploadDocumentsResponse | EstoreErrorResponse>} A promise that resolves to a response object indicating the status of the operation.
 */
export const uploadSupportingDocuments = async (
  siteId: string,
  dealIdentifier: string,
  file: EstoreDocument,
): Promise<DocumentCreationResponse | EstoreErrorResponse> => {
  try {
    if (!isValidSiteId(siteId) || !validUkefId(dealIdentifier)) {
      console.error('Invalid site or deal ID %s %s', siteId, dealIdentifier);
      throw new Error('Invalid site or deal ID');
    }

    const endpoint = `v1/${ENDPOINT.SITE}/${siteId}/${ENDPOINT.DEAL}/${dealIdentifier}/${ENDPOINT.DOCUMENT}`;
    return postToEstore(endpoint, [file], oneMinute);
  } catch (error: unknown) {
    console.error('❌ eStore uploading document has failed %o', error);
    return estoreInternalServerError(error);
  }
};
