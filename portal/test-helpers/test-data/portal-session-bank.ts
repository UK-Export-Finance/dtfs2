import { PortalSessionBank } from '@ukef/dtfs2-common';
import { aMonthlyBankReportPeriodSchedule } from './utilisation-reporting-schedule';

export const aBank = (): PortalSessionBank => ({
  _id: '6597dffeb5ef5ff4267e5044',
  id: '956',
  name: 'Barclays Bank',
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
