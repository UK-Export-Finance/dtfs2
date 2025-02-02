import { IsoDateTimeStamp } from '@ukef/dtfs2-common';

export type GetCompletedFeeRecordCorrectionsResponseBody = {
  id: number;
  dateSent: IsoDateTimeStamp;
  exporter: string;
  formattedReasons: string;
  formattedPreviousValues: string;
  formattedCorrectedValues: string;
  bankCommentary?: string;
}[];
