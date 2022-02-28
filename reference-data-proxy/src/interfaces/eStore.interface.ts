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
  status: number;
  data: {
    siteName: string;
  };
}

export interface SiteExistsResponse {
  status: number;
  data: {
    status: string;
    siteName: string;
  };
}

export interface BuyerFolderResponse {
  status: number;
  data: {
    buyerName: string;
  };
}

export interface DealFolderResponse {
  status: number;
  data: {
    foldername: string;
  };
}

export interface FacilityFolderResponse {
  status: number;
  data: {
    foldername: string;
  };
}

export interface UploadDocumentsResponse {
  status: number;
  data: {
    fileUpload: string;
  };
}

export interface TermStoreResponse {
  status: number;
  data: {
    message: string;
  };
}
