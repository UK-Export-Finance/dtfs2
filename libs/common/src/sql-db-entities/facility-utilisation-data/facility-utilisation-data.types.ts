import { ReportPeriod } from '../../types';
import { DbRequestSource } from '../helpers';

export type CreateFacilityUtilisationDataWithoutUtilisationParams = {
  id: string;
  reportPeriod: ReportPeriod;
  requestSource: DbRequestSource;
};
