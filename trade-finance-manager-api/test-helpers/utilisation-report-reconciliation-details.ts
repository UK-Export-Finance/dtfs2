import { UtilisationReportReconciliationDetailsResponseBody } from '../src/v1/api-response-types';

export const aUtilisationReportReconciliationDetailsResponse = (): UtilisationReportReconciliationDetailsResponseBody => ({
  reportId: 1,
  bank: {
    id: '123',
    name: 'Test bank',
  },
  status: 'PENDING_RECONCILIATION',
  reportPeriod: {
    start: { month: 1, year: 2024 },
    end: { month: 2, year: 2024 },
  },
  dateUploaded: new Date().toString(),
  premiumPayments: [],
  paymentDetails: [],
  keyingSheet: [],
});
