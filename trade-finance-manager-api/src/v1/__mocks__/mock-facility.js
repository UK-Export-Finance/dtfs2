const MOCK_FACILITY = {
  _id: '12345678',
  ukefFacilityID: '0040004833',
  bondIssuer: 'Issuer',
  bondType: 'Advance payment guarantee',
  facilityStage: 'Unissued',
  ukefGuaranteeInMonths: '10',
  bondBeneficiary: 'test',
  guaranteeFeePayableByBank: '9.0000',
  facilityValue: '12345.00',
  currencySameAsSupplyContractCurrency: 'true',
  riskMarginFee: '10',
  coveredPercentage: '20',
  minimumRiskMarginFee: '30',
  ukefExposure: '2,469.00',
  feeType: 'At maturity',
  dayCountBasis: '365',
  currency: {
    text: 'GBP - UK Sterling',
    id: 'GBP',
  },
  'coverEndDate-day': '20',
  'coverEndDate-month': '10',
  'coverEndDate-year': '2020',
  bankReferenceNumber: '12345678',
};

module.exports = MOCK_FACILITY;
