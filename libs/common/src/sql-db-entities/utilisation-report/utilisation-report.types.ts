import { ReportPeriodPartialEntity } from '../partial-entities';
import { DbRequestSourceParam } from '../helpers';

export type CreateNotReceivedUtilisationReportEntity = DbRequestSourceParam & {
  bankId: string;
  reportPeriod: ReportPeriodPartialEntity;
};
