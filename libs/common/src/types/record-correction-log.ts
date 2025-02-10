import { Response } from 'express';
import { ReportPeriodPartialEntity } from '../sql-db-entities';

export type RecordCorrectionLogFields = {
  facilityId: string;
  exporter: string;
  formattedReasons: string;
  formattedDateSent: string;
  formattedOldRecords: string;
  formattedCorrectRecords: string;
  isCompleted: boolean;
  bankTeamName: string;
  formattedBankTeamEmails: string;
  additionalInfo: string;
  formattedBankCommentary: string;
  formattedDateReceived: string;
  formattedRequestedByUser: string;
};

export type GetRecordCorrectionLogDetailsResponseBody = {
  correctionDetails: RecordCorrectionLogFields;
  bankName: string;
  reportId: number;
  reportPeriod: ReportPeriodPartialEntity;
};

export type GetRecordCorrectionLogDetailsResponse = Response<GetRecordCorrectionLogDetailsResponseBody | string>;
