import { CURRENCY, UtilisationReportRawCsvData } from '@ukef/dtfs2-common';

export const MOCK_UTILISATION_REPORT_RAW_CSV_DATA: UtilisationReportRawCsvData = {
  'ukef facility id': '0123456789',
  'base currency': CURRENCY.GBP,
  'facility utilisation': '100.00',
  'total fees accrued for the period': '80.00',
  'accrual currency': CURRENCY.GBP,
  'accrual exchange rate': '1',
  'fees paid to ukef for the period': '80.00',
  'fees paid to ukef currency': CURRENCY.GBP,
  exporter: 'test exporter',
  'payment currency': CURRENCY.GBP,
  'payment exchange rate': '1',
};
