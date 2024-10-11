import { ReportPeriod } from '../../types';
import { DbRequestSource } from '../helpers';

export type CreateFacilityUtilisationDataParams = {
  id: string;
  reportPeriod: ReportPeriod;
  utilisation: number;
  fixedFee: number;
  requestSource: DbRequestSource;
};

export type UpdateWithCurrentReportPeriodDetailsParams = {
  fixedFee: number;
  utilisation: number;
  reportPeriod: ReportPeriod;
  requestSource: DbRequestSource;
};
