const MOCK_BOND = {
  type: 'Bond',
  bondIssuer: 'issuer',
  bondType: 'bond type',
  facilityStage: 'unissued',
  ukefGuaranteeInMonths: '24',
  name: '1234',
  bondBeneficiary: 'test',
  value: '123',
  currencySameAsSupplyContractCurrency: 'true',
  riskMarginFee: '1',
  coveredPercentage: '2',
  feeType: 'test',
  feeFrequency: 'Quarterly',
  dayCountBasis: 'test',
};

const MOCK_LOAN = {
  type: 'Loan',
  facilityStage: 'Unconditional',
  hasBeenIssued: true,
  name: '123',
  value: '123',
  disbursementAmount: '12',
  ukefGuaranteeInMonths: '12',
  currencySameAsSupplyContractCurrency: 'true',
  interestMarginFee: '5',
  coveredPercentage: '40',
  premiumType: 'At maturity',
  dayCountBasis: '365',
};

module.exports = {
  MOCK_BOND,
  MOCK_LOAN,
};
