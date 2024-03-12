import { ObjectId } from 'mongodb';

// Input interfaces
export interface Estore {
  dealId: ObjectId;
  siteId: string;
  facilityIdentifiers: number[];
  supportingInformation: string[];
  exporterName: string;
  buyerName: string;
  dealIdentifier: string;
  destinationMarket: string;
  riskMarket: string;
}

export interface EstoreSite {
  readonly exporterName: string;
}

export interface EstoreTermStore {
  readonly id: string;
}

export interface EstoreBuyer extends EstoreSite {
  readonly buyerName: string;
}

export interface EstoreDealFolder extends EstoreBuyer {
  readonly dealIdentifier: string;
  readonly destinationMarket: string;
  readonly riskMarket: string;
}

export interface EstoreFacilityFolder extends EstoreBuyer {
  readonly facilityIdentifier: string;
}

export interface EstoreDealFiles {
  readonly buyerName: string;
  readonly documentType: string;
  readonly fileName: string;
  readonly fileLocationPath: string;
}

// Output interfaces

/**
 * Interface representing the response object for the Estore system.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the response data.
 */
export interface EstoreResponse {
  readonly status: number;
  readonly data: object;
}

/**
 * Interface representing the response object for site creation.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the siteId.
 * @property {string} data.siteId - The ID of the created site.
 */
export interface SiteCreationResponse {
  readonly status: number;
  readonly data: {
    siteId: string;
  };
}

/**
 * Interface representing the response object for checking if a site exists.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the status and siteId.
 * @property {string} data.status - The status of the site existence.
 * @property {string} data.siteId - The ID of the site.
 */
export interface SiteExistsResponse {
  readonly status: number;
  readonly data: {
    status: string;
    siteId: string;
  };
}

/**
 * Interface representing the response object for a buyer folder in the Estore system.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the buyer name and error message.
 * @property {string} data.buyerName - The name of the buyer.
 * @property {string} data.error - The error message, if any.
 */
export interface BuyerFolderResponse {
  readonly status: number;
  readonly data: {
    buyerName?: string;
    error?: string;
  };
}

/**
 * Interface representing the response object for a deal folder in the Estore system.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the folder name and error message.
 * @property {string} data.foldername - The name of the folder.
 * @property {string} data.error - The error message, if any.
 */
export interface DealFolderResponse {
  readonly status: number;
  readonly data: {
    foldername?: string;
    error?: string;
  };
}

/**
 * Interface representing the response object for a facility folder in the Estore system.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the folder name and error message.
 * @property {string} data.foldername - The name of the folder.
 * @property {string} data.error - The error message, if any.
 */
export interface FacilityFolderResponse {
  readonly status: number;
  readonly data: {
    foldername?: string;
    error?: string;
  };
}

/**
 * Interface representing the response object for uploading documents in the Estore system.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the file upload status and error message.
 * @property {string} data.fileUpload - The status of the file upload.
 * @property {string} data.error - The error message, if any.
 */
export interface UploadDocumentsResponse {
  readonly status: number;
  readonly data: {
    fileUpload?: string;
    error?: string;
  };
}

/**
 * Interface representing the response object for the TermStore system.
 *
 * @property {number} status - The status code of the response.
 * @property {object} data - The data object containing the message.
 * @property {string} data.message - The message of the response.
 */
export interface TermStoreResponse {
  readonly status: number;
  readonly data: {
    message: string;
  };
}

/**
 * Interface representing the response object for an error in the Estore system.
 *
 * @property {number} status - The status code of the error.
 * @property {object} error - The error object containing additional information about the error.
 */
export interface EstoreErrorResponse {
  readonly status: number;
  readonly data: {
    status?: number;
    siteId?: string;
    message?: string;
  };
}
