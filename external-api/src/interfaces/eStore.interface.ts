export interface Estore {
  dealId: string;
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

export interface SiteCreationResponse {
  readonly status: number;
  readonly data: {
    siteId: string;
  };
}

export interface SiteExistsResponse {
  readonly status: number;
  readonly data: {
    status: string;
    siteId: string;
  };
}

export interface BuyerFolderResponse {
  readonly status: number;
  readonly data: {
    buyerName?: string;
    error?: string;
  };
}

export interface DealFolderResponse {
  readonly status: number;
  readonly data: {
    foldername?: string;
    error?: string;
  };
}

export interface FacilityFolderResponse {
  readonly status: number;
  readonly data: {
    foldername?: string;
    error?: string;
  };
}

export interface UploadDocumentsResponse {
  readonly status: number;
  readonly data: {
    fileUpload?: string;
    error?: string;
  };
}

export interface TermStoreResponse {
  readonly status: number;
  readonly data: {
    message: string;
  };
}
