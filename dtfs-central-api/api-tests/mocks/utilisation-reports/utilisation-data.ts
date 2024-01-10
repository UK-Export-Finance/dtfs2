import { ObjectId } from 'mongodb';
import { MOCK_UTILISATION_REPORT } from './utilisation-reports';
import { UtilisationData } from '../../../src/types/db-models/utilisation-data';
import { UtilisationReport } from '../../../src/types/db-models/utilisation-reports';

export const MOCK_UTILISATION_DATA: UtilisationData = {
  _id: new ObjectId('65646e1d1621576fd7a6bc9b'),
  facilityId: '',
  reportId: MOCK_UTILISATION_REPORT._id.toString(),
  bankId: MOCK_UTILISATION_REPORT.bank.id,
  month: MOCK_UTILISATION_REPORT.month,
  year: MOCK_UTILISATION_REPORT.year,
  exporter: 'Exporter 1',
  baseCurrency: 'GBP',
  facilityUtilisation: 100000,
  totalFeesAccruedForTheMonth: 456,
  monthlyFeesPaidToUkef: 123,
  paymentCurrency: 'GBP',
  exchangeRate: 1,
  payments: null,
};

export const getMockUtilisationDataForReport = (report: UtilisationReport, overrides?: Partial<UtilisationData>) => ({
  ...MOCK_UTILISATION_DATA,
  reportId: report._id.toString(),
  bankId: report.bank.id,
  month: report.month,
  year: report.year,
  ...overrides,
});
