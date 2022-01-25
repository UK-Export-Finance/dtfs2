const MOCK_CASH_FACILITY = {
  dealId: 'MOCK_GEF_DEAL',
  coverEndDate: '2021-08-12T00:00:00.000Z',
  coverStartDate: '2021-10-08T00:00:00.000Z',
  coverPercentage: 12,
  createdAt: 1628693855675.0,
  currency: { id: 'GBP' },
  details: [
    'RESOLVING',
  ],
  detailsOther: '',
  interestPercentage: 24,
  monthsOfCover: 10,
  name: 'issued1',
  paymentType: null,
  shouldCoverStartOnSubmission: true,
  type: 'Cash',
  ukefExposure: 1481472,
  updatedAt: 1628770126497.0,
  value: 123456,
  ukefFacilityId: '123',
  guaranteeFee: 10.8,
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
};

const MOCK_CONTINGENT_FACILITY = {
  dealId: 'MOCK_GEF_DEAL',
  coverEndDate: '2021-10-12T00:00:00.000Z',
  coverStartDate: '2021-12-08T00:00:00.000Z',
  coverPercentage: 12,
  createdAt: 1628693855675.0,
  currency: { id: 'GBP' },
  details: [
    'RESOLVING',
  ],
  detailsOther: '',
  interestPercentage: 24,
  monthsOfCover: 10,
  name: 'issued1',
  paymentType: null,
  shouldCoverStartOnSubmission: true,
  type: 'Contingent',
  ukefExposure: 1481472,
  updatedAt: 1628770126497.0,
  value: 123456,
  ukefFacilityId: '123',
  guaranteeFee: 10.8,
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
};

const MOCK_CASH_CONTINGENT_FACILIIES = [
  {
    _id: 'MOCK_CASH_FACILITY_ISSUED',
    ...MOCK_CASH_FACILITY,
    hasBeenIssued: true,
    submittedAsIssuedDate: 1641054981000,
  },
  {
    _id: 'MOCK_CONTINGENT_FACILITY_ISSUED',
    ...MOCK_CONTINGENT_FACILITY,
    hasBeenIssued: true,
    submittedAsIssuedDate: 1641054981000,
  },
  {
    _id: 'MOCK_CONTINGENT_FACILITY_UNISSUED',
    ...MOCK_CONTINGENT_FACILITY,
  },
];

module.exports = MOCK_CASH_CONTINGENT_FACILIIES;
