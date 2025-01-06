import { FeeRecordStatus } from './utilisation-reports';

export type RequestedByUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export type FeeRecordCorrectionSummary = {
  correctionId: number;
  feeRecordId: number;
  facilityId: string;
  exporter: string;
  formattedReasons: string;
  formattedDateSent: string;
  requestedBy: string;
  status: FeeRecordStatus;
};
