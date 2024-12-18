import { FeeRecordStatus } from './utilisation-reports';

export type RequestedByUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export type FeeRecordCorrection = {
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  reasons: string;
  dateSent: string;
  requestedBy: string;
  status: FeeRecordStatus;
};
