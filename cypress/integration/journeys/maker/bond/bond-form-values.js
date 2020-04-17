const DETAILS = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'maintenanceBond',
    text: 'Maintenance bond',
  },
  ukefGuaranteeInMonths: '12',
  requestedCoverStartDateDay: '16',
  requestedCoverStartDateMonth: '10',
  requestedCoverStartDateYear: '2021',
  coverEndDateDay: '14',
  coverEndDateMonth: '12',
  coverEndDateYear: '2025',
  uniqueIdentificationNumber: '123456',
  bondBeneficiary: 'mock beneficiary',
};

const FINANCIAL_DETAILS = {
  bondValue: '123',
  currency: {
    value: 'EUR',
    text: 'EUR - Euros',
  },
  conversionRate: '100',
  conversionRateDateDay: '01',
  conversionRateDateMonth: '02',
  conversionRateDateYear: '2020',
  riskMarginFee: '20',
  coveredPercentage: '80',
  minimumRiskMarginFee: '1.23',
};

module.exports = {
  DETAILS,
  FINANCIAL_DETAILS,
};
