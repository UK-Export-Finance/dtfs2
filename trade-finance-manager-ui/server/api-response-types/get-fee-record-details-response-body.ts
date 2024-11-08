import { SessionBank, ReportPeriod } from '@ukef/dtfs2-common';

export type GetFeeRecordDetailsResponseBody = {
  id: number;
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  facilityId: string;
  exporter: string;
};
