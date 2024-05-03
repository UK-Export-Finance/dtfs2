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

const MOCK_BANKS = {
  BARCLAYS: {
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
    utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
  },
  HSBC: {
    id: '961',
    name: 'HSBC',
    mga: ['Test.pdf'],
    emails: ['checker4@ukexportfinance.gov.uk'],
    companiesHouseNo: '00014259',
    partyUrn: '00300342',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'HSBC Payment Reporting Team',
      emails: ['payment-officer4@ukexportfinance.gov.uk'],
    },
    utilisationReportPeriodSchedule: MONTHLY_REPORT_PERIOD_SCHEDULE,
  },
};

module.exports = MOCK_BANKS;
