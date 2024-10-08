import { PortalSessionUser } from '@ukef/dtfs2-common';

export const MOCK_PORTAL_SESSION_USER: PortalSessionUser = {
  _id: '65954cc526d3899694cafff2',
  username: 'PAYMENT_REPORT_OFFICER',
  firstname: 'PAYMENT',
  surname: 'REPORT OFFICER',
  email: 'test@testing.com',
  roles: ['payment-report-officer'],
  bank: {
    id: '1',
    _id: '1',
    name: 'Test',
    mga: [],
    emails: ['test2@testing.com'],
    companiesHouseNo: 'test123',
    partyUrn: 'test123',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'team',
      emails: ['payment@testing.com'],
    },
    utilisationReportPeriodSchedule: [],
    isVisibleInTfmUtilisationReports: true,
  },
  timezone: 'Europe/London',
  'user-status': 'active',
  isTrusted: false,
};
