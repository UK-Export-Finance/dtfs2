import { PRIMARY_NAVIGATION_KEYS } from '../../server/constants';
import { AddPaymentViewModel } from '../../server/types/view-models';
import { aTfmSessionUser } from './tfm-session-user';

export const anAddPaymentViewModel = (): AddPaymentViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
  reportId: 12,
  bank: { name: 'Test bank ' },
  formattedReportPeriod: 'Some reporting period',
  reportedFeeDetails: {
    totalReportedPayments: 'GBP 200',
    feeRecords: [
      {
        feeRecordId: 123,
        facilityId: '12345',
        exporter: 'export',
        reportedFee: 'GBP 200',
        reportedPayments: 'GBP 200',
      },
    ],
  },
  selectedFeeRecordCheckboxIds: [],
  errors: {
    errorSummary: [],
  },
  formValues: {
    paymentDate: {},
  },
  paymentNumber: undefined,
});
