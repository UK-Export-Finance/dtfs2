import { AddPaymentViewModel } from '../../server/types/view-models';

export const anAddPaymentViewModel = (): AddPaymentViewModel => ({
  bank: { name: 'Test bank ' },
  reportPeriod: 'Some reporting period',
  reportedFeeDetails: {
    totalReportedPayments: 'GBP 200',
    feeRecords: [],
  },
});
