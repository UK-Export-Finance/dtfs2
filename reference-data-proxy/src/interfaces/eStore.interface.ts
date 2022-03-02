export interface Estore {
  siteName: string;
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
  readonly destinationMarket: string;
  readonly riskMarket: string;
}

export interface EstoreDealFiles {
  readonly documentType: string;
  readonly fileName: string;
  readonly fileLocationPath: string;
}

export interface SiteCreationResponse {
  readonly status: number;
  readonly data: {
    siteName: string;
  };
}

export interface SiteExistsResponse {
  readonly status: number;
  readonly data: {
    status: string;
    siteName: string;
  };
}

export interface BuyerFolderResponse {
  readonly status: number;
  readonly data: {
    buyerName: string;
  };
}

export interface DealFolderResponse {
  readonly status: number;
  readonly data: {
    foldername: string;
  };
}

export interface FacilityFolderResponse {
  readonly status: number;
  readonly data: {
    foldername: string;
  };
}

export interface UploadDocumentsResponse {
  readonly status: number;
  readonly data: {
    fileUpload: string;
  };
}

export interface TermStoreResponse {
  readonly status: number;
  readonly data: {
    message: string;
  };
}
