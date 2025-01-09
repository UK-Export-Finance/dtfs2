import { FeeRecordStatus } from './utilisation-reports';

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

export type FeeRecordCorrectionSummary = {
  correctionId: number;
  feeRecordId: number;
  exporter: string;
  formattedReasons: string;
  formattedDateSent: string;
  status: FeeRecordStatus;
  formattedOldRecords: string;
  formattedCorrectRecords: string;
};
