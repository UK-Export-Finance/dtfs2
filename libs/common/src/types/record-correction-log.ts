import { Response } from 'express';
import { ReportPeriodPartialEntity } from '../sql-db-entities';

export type RecordCorrectionLogFields = {
  facilityId: string;
  correctionId: number;
  feeRecordId: number;
  exporter: string;
  formattedReasons: string;
  formattedDateSent: string;
  formattedOldRecords: string;
  formattedCorrectRecords: string;
  isCompleted: boolean;
  bankTeamName: string;
  bankTeamEmails: string;
  additionalInfo: string;
  formattedBankCommentary: string;
  formattedDateReceived: string;
};

export type GetRecordCorrectionLogDetailsResponseBody = {
  fields: RecordCorrectionLogFields;
  bankName: string;
  reportPeriod: ReportPeriodPartialEntity;
};

export type GetRecordCorrectionLogDetailsResponse = Response<GetRecordCorrectionLogDetailsResponseBody | string>;
