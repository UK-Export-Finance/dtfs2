import { UtilisationDataEntity } from '../../sql-db-entities';
import { MOCK_UTILISATION_REPORT_ENTITY } from './utilisation-report.entity.mock';
import { MOCK_AUDITABLE_BASE_ENTITY } from './auditable.base-entity.mock';

export const MOCK_UTILISATION_DATA_ENTITY: UtilisationDataEntity = {
  id: 1,
  facilityId: '123',
  report: MOCK_UTILISATION_REPORT_ENTITY,
  exporter: 'potato person',
  baseCurrency: 'GBP',
  facilityUtilisation: 100,
  totalFeesAccruedForTheMonth: 100,
  totalFeesAccruedForTheMonthCurrency: 'GBP',
  totalFeesAccruedForTheMonthExchangeRate: 1,
  monthlyFeesPaidToUkef: 100,
  monthlyFeesPaidToUkefCurrency: 'GBP',
  paymentCurrency: 'GBP',
  paymentExchangeRate: 1,
  ...MOCK_AUDITABLE_BASE_ENTITY,
};
