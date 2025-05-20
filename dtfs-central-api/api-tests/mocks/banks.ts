import { ObjectId } from 'mongodb';
import { Bank } from '@ukef/dtfs2-common';

const MONTHLY_REPORT_PERIOD_SCHEDULE = [
  { startMonth: 1, endMonth: 1 },
  { startMonth: 2, endMonth: 2 },
  { startMonth: 3, endMonth: 3 },
  { startMonth: 4, endMonth: 4 },
  { startMonth: 5, endMonth: 5 },
  { startMonth: 6, endMonth: 6 },
  { startMonth: 7, endMonth: 7 },
  { startMonth: 8, endMonth: 8 },
  { startMonth: 9, endMonth: 9 },
  { startMonth: 10, endMonth: 10 },
  { startMonth: 11, endMonth: 11 },
  { startMonth: 12, endMonth: 12 },
];

type BankName = 'bank1' | 'bank2';

export const MOCK_BANKS: Record<BankName, Bank> = {
  bank1: {
    _id: new ObjectId('6597dffeb5ef5ff4267e5044'),
    id: '9',
    name: 'Bank 1',
    mga: ['Test.pdf'],
    emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    companiesHouseNo: '01026167',
    partyUrn: '00300130',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'Bank 1 Payment Reporting Team',
      emails: ['payment-officer4@ukexportfinance.gov.uk'],
    },
    utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
    isVisibleInTfmUtilisationReports: true,
  },
  bank2: {
    _id: new ObjectId('6597e018fe34214bc0dac161'),
    id: '961',
    name: 'Bank 2',
    mga: ['Test.pdf'],
    emails: ['checker4@ukexportfinance.gov.uk'],
    companiesHouseNo: '00014259',
    partyUrn: '00300342',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'Bank 2 Payment Reporting Team',
      emails: ['payment-officer4@ukexportfinance.gov.uk'],
    },
    utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
    isVisibleInTfmUtilisationReports: true,
  },
};
