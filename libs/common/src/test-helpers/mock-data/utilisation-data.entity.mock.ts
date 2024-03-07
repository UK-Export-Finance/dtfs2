import { UtilisationDataEntity } from '../../sql-db-entities';
import { MOCK_AUDITABLE_BASE_ENTITY } from './auditable.base-entity.mock';
import { UtilisationReportEntityMockBuilder } from './utilisation-report.entity.mock-builder';

const mockUploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

export const MOCK_UTILISATION_DATA_ENTITY: UtilisationDataEntity = {
  ...MOCK_AUDITABLE_BASE_ENTITY,
  id: 1,
  facilityId: '123',
  report: mockUploadedUtilisationReport,
  exporter: 'test exporter',
  baseCurrency: 'GBP',
  facilityUtilisation: 100,
  totalFeesAccruedForTheMonth: 100,
  totalFeesAccruedForTheMonthCurrency: 'GBP',
  totalFeesAccruedForTheMonthExchangeRate: 1,
  monthlyFeesPaidToUkef: 100,
  monthlyFeesPaidToUkefCurrency: 'GBP',
  paymentCurrency: 'GBP',
  paymentExchangeRate: 1,
};
