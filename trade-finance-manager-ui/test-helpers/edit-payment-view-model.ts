import { CURRENCY } from '@ukef/dtfs2-common';
import { EditPaymentViewModel } from '../server/types/view-models';

export const anEditPaymentViewModel = (): EditPaymentViewModel => ({
  reportId: '1',
  paymentId: '1',
  paymentCurrency: CURRENCY.GBP,
  bank: { id: '123', name: 'Test bank' },
  formattedReportPeriod: 'January 2024',
  feeRecords: [],
  totalReportedPayments: 'GBP 314.59',
  errors: { errorSummary: [] },
  formValues: { paymentDate: {} },
  redirectTab: 'keying-sheet',
  backLinkHref: '/utilisation-reports/12#keying-sheet',
});
