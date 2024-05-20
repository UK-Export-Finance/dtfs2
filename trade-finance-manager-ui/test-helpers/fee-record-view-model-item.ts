import { FeeRecordViewModelItem } from '../server/types/view-models';

export const aFeeRecordViewModelItem = (): FeeRecordViewModelItem => ({
  id: 1,
  facilityId: '12345678',
  exporter: 'Test exporter',
  reportedFees: {
    formattedCurrencyAndAmount: 'GBP 100.00',
    dataSortValue: 0,
  },
  reportedPayments: {
    formattedCurrencyAndAmount: 'GBP 100.00',
    dataSortValue: 0,
  },
  totalReportedPayments: {
    formattedCurrencyAndAmount: 'GBP 100.00',
    dataSortValue: 0,
  },
  paymentsReceived: {
    formattedCurrencyAndAmount: 'GBP 100.00',
    dataSortValue: 0,
  },
  totalPaymentsReceived: {
    formattedCurrencyAndAmount: 'GBP 100.00',
    dataSortValue: 0,
  },
  status: 'TO_DO',
  displayStatus: 'TO DO',
});
