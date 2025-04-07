import { PortalSessionBank } from '../types/portal-session-data/portal-session-bank';
import { aMonthlyBankReportPeriodSchedule } from './bank-report-period-schedule';

export const aPortalSessionBank = (): PortalSessionBank => ({
  _id: '6597dffeb5ef5ff4267e5044',
  id: '956',
  name: 'Test Bank 1',
  mga: ['Test.pdf'],
  emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
  companiesHouseNo: '01026167',
  partyUrn: '00300130',
  hasGefAccessOnly: false,
  paymentOfficerTeam: {
    teamName: 'Barclays Payment Reporting Team',
    emails: ['payment-officer4@ukexportfinance.gov.uk'],
  },
  utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
  isVisibleInTfmUtilisationReports: true,
});
