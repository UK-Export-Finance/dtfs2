export type RequestedByUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export type PendingCorrection = {
  correctionId: number;
  facilityId: string;
  exporter: string;
  additionalInfo: string;
};
