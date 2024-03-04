import { ObjectId } from 'mongodb';
import { UtilisationData, UtilisationReport, CURRENCY } from '@ukef/dtfs2-common';
import { MOCK_UTILISATION_REPORT } from './utilisation-reports';
import { MOCK_MONTHLY_REPORT_PERIOD } from '../report-period';

export const MOCK_UTILISATION_DATA: UtilisationData = {
  _id: new ObjectId('65646e1d1621576fd7a6bc9b'),
  facilityId: '',
  reportId: MOCK_UTILISATION_REPORT._id.toString(),
  bankId: MOCK_UTILISATION_REPORT.bank.id,
  reportPeriod: MOCK_MONTHLY_REPORT_PERIOD,
  exporter: 'Exporter 1',
  baseCurrency: CURRENCY.GBP,
  facilityUtilisation: 100000,
  totalFeesAccruedForTheMonth: 456,
  totalFeesAccruedForTheMonthCurrency: CURRENCY.GBP,
  totalFeesAccruedForTheMonthExchangeRate: 1,
  monthlyFeesPaidToUkef: 123,
  monthlyFeesPaidToUkefCurrency: CURRENCY.GBP,
  paymentCurrency: CURRENCY.GBP,
  paymentExchangeRate: 1,
  payments: null,
};

export const getMockUtilisationDataForReport = (report: UtilisationReport, overrides?: Partial<UtilisationData>): UtilisationData => ({
  ...MOCK_UTILISATION_DATA,
  reportId: report._id.toString(),
  bankId: report.bank.id,
  reportPeriod: report.reportPeriod,
  ...overrides,
});
