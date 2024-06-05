import { AddPaymentViewModel } from '../../server/types/view-models';

export const anAddPaymentViewModel = (): AddPaymentViewModel => ({
  bank: { name: 'Test bank ' },
  formattedReportPeriod: 'Some reporting period',
  reportedFeeDetails: {
    totalReportedPayments: 'GBP 200',
    feeRecords: [
      {
        feeRecordId: 123,
        facilityId: '12345',
        exporter: 'export',
        reportedFee: { value: 'GBP 200', dataSortValue: 1 },
        reportedPayments: { value: 'GBP 200', dataSortValue: 1 },
      },
    ],
  },
});
