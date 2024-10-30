import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationDetailsResponseBody } from '../server/api-response-types';

export const aUtilisationReportReconciliationDetailsResponse = (): UtilisationReportReconciliationDetailsResponseBody => ({
  reportId: 1,
  bank: {
    id: '123',
    name: 'Test bank',
  },
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
  reportPeriod: {
    start: { month: 1, year: 2024 },
    end: { month: 2, year: 2024 },
  },
  dateUploaded: new Date().toString(),
  premiumPayments: [],
  paymentDetails: [],
  keyingSheet: [],
  utilisationDetails: [],
});
