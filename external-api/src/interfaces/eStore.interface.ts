// Input

import { Category } from '../helpers/types/estore';

/**
 * Represents the main structure for an eStore, including deal, site, and various identifiers.
 *
 * @interface Estore
 * @property {string} dealId - Unique identifier for the deal.
 * @property {string} siteId - Unique identifier for the site.
 * @property {string[]} facilityIdentifiers - Array of identifiers for facilities.
 * @property {string[]} supportingInformation - Array of supporting information strings.
 * @property {string} exporterName - Name of the exporter.
 * @property {string} buyerName - Name of the buyer.
 * @property {string} dealIdentifier - Unique identifier for the deal.
 * @property {string} destinationMarket - Destination market for the deal.
 * @property {string} riskMarket - Risk market for the deal.
 */
export interface Estore {
  dealId: string;
  siteId: string;
  facilityIdentifiers: string[];
  supportingInformation: string[];
  exporterName: string;
  buyerName: string;
  dealIdentifier: string;
  destinationMarket: string;
  riskMarket: string;
}

/**
 * Defines the basic structure for an eStore site, primarily focused on the exporter's name.
 *
 * @interface EstoreSite
 * @property {string} exporterName - Name of the exporter.
 */
export interface EstoreSite {
  readonly exporterName: string;
}

/**
 * Represents a term store within the eStore, identified by a unique string ID.
 *
 * @interface EstoreTermStore
 * @property {string} facilityId - Unique identifier for the term store.
 */
export interface EstoreTermStore {
  readonly facilityId: string;
}

/**
 * Extends EstoreSite to include buyer information, specifically the buyer's name.
 *
 * @interface EstoreBuyer
 * @extends EstoreSite
 * @property {string} buyerName - Name of the buyer.
 */
export interface EstoreBuyer extends EstoreSite {
  readonly buyerName: string;
}

/**
 * Represents a deal folder within the eStore, including deal and market information.
 *
 * @interface EstoreDealFolder
 * @extends EstoreBuyer
 * @property {string} dealIdentifier - Unique identifier for the deal.
 * @property {string} destinationMarket - Destination market for the deal.
 * @property {string} riskMarket - Risk market for the deal.
 */
export interface EstoreDealFolder extends EstoreBuyer {
  readonly dealIdentifier: string;
  readonly destinationMarket: string;
  readonly riskMarket: string;
}

/**
 * Represents a facility folder within the eStore, identified by a facility identifier.
 *
 * @interface EstoreFacilityFolder
 * @extends EstoreBuyer
 * @property {string} facilityIdentifier - Unique identifier for the facility.
 */
export interface EstoreFacilityFolder extends EstoreBuyer {
  readonly facilityIdentifier: string;
}

/**
 * Defines the structure for documents within the eStore, including type, name, and location.
 *
 * @interface EstoreDealFiles
 * @property {string} buyerName - Name of the buyer.
 * @property {string} documentType - Type of the document.
 * @property {string} fileName - Name of the file.
 * @property {string} fileLocationPath - Path to the file location.
 */
export interface EstoreDealFiles {
  readonly buyerName: string;
  readonly documentType: string;
  readonly fileName: string;
  readonly fileLocationPath: string;
}

/**
 * Represents a generic Axios response from the eStore, including status and data.
 *
 * @interface EstoreAxiosResponse
 * @property {number} status - HTTP status code of the response.
 * @property {object} body - Body payload comprising a response.
 */
export interface EstoreAxiosResponse {
  readonly status: number;
  readonly body: {
    message?: string;
  };
}

/**
 * Represents a generic response from the eStore, including status and data.
 *
 * @interface EstoreResponse
 * @property {number} status - HTTP status code of the response.
 * @property {object} data - Data payload of the response.
 */
export interface EstoreResponse {
  readonly status: number;
  readonly data: object;
}

/**
 * Represents the response for site creation within the eStore, including the site ID.
 *
 * @interface SiteCreationResponse
 * @extends EstoreResponse
 * @property {string} data.siteId - Unique identifier for the created site.
 */
export interface SiteCreationResponse {
  readonly status: number;
  readonly data: {
    siteId: string;
  };
}

/**
 * Represents a response from APIM on eStore site existence check.
 *
 * @interface SiteExistsResponse
 * @extends EstoreResponse
 * @property {string} data.status - Status message.
 * @property {string} data.siteId - Unique identifier for the existing site.
 * @property {number} data.statusCode - HTTP status code.
 * @property {string} data.message - Message comprising site status.
 */
export interface SiteExistsResponse {
  readonly status: number;
  readonly data: {
    status: string;
    siteId: string;
    statusCode?: number;
    message?: string;
  };
}

/**
 * Represents the response for a buyer folder operation within the eStore.
 *
 * @interface BuyerFolderResponse
 * @extends EstoreResponse
 * @property {string} data.buyerName - Name of the buyer.
 * @property {string} data.error - Error message, if any.
 */
export interface BuyerFolderResponse {
  readonly status: number;
  readonly data: {
    buyerName?: string;
    error?: string;
  };
}

/**
 * Represents the response for a deal folder operation within the eStore.
 *
 * @interface DealFolderResponse
 * @extends EstoreResponse
 * @property {string} data.foldername - Name of the deal folder.
 * @property {string} data.error - Error message, if any.
 */
export interface DealFolderResponse {
  readonly status: number;
  readonly data: {
    foldername?: string;
    error?: string;
  };
}

/**
 * Represents the response for a facility folder operation within the eStore.
 *
 * @interface FacilityFolderResponse
 * @extends EstoreResponse
 * @property {string} data.foldername - Name of the facility folder.
 * @property {string} data.error - Error message, if any.
 * @property {unknown} data.message - Additional message, if any.
 */
export interface FacilityFolderResponse {
  readonly status: number;
  readonly data: {
    foldername?: string;
    error?: string;
    message?: unknown;
  };
}

/**
 * Represents the response for a document upload operation within the eStore.
 *
 * @interface UploadDocumentsResponse
 * @extends EstoreResponse
 * @property {string} data.fileUpload - Status of the file upload.
 * @property {string} data.error - Error message, if any.
 */
export interface UploadDocumentsResponse {
  readonly status: number;
  readonly data: {
    fileUpload?: string;
    error?: string;
  };
}

/**
 * Represents the response for a term store operation within the eStore.
 *
 * @interface TermStoreResponse
 * @extends EstoreResponse
 * @property {string} data.message - Message related to the term store operation.
 */
export interface TermStoreResponse {
  readonly status: number;
  readonly data: {
    message: string;
  };
}

/**
 * Represents an error response from the eStore, including status, site ID, and message.
 *
 * @interface EstoreErrorResponse
 * @extends EstoreResponse
 * @property {number} data.status - HTTP status code of the error response.
 * @property {string} data.siteId - Site ID related to the error, if applicable.
 * @property {unknown} data.message - Error message.
 */
export interface EstoreErrorResponse {
  readonly status: number;
  readonly data: {
    status?: number;
    siteId?: string;
    message?: unknown;
  };
}

/**
 * Represents a cron job for the eStore.
 *
 * @interface EstoreCronJob
 * @property {Estore} data - The eStore data containing information about the deal, exporter, and other relevant details.
 * @property {Category} category - The category of the cron job.
 * @property {boolean} [kill] - Optional flag to indicate if the cron job should be stopped.
 */
export interface EstoreCronJob {
  readonly data: Estore;
  readonly category: Category;
  readonly kill?: boolean;
}
