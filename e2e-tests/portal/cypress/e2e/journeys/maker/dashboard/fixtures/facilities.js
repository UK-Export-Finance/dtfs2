import { BOND_FACILITY_TYPE, CURRENCY } from '@ukef/dtfs2-common';
import CONSTANTS from '../../../../../fixtures/constants';

const CASH_FACILITY = {
  coverEndDate: '2021-08-12T00:00:00.000Z',
  coverStartDate: '2021-10-08T00:00:00.000Z',
  coverPercentage: 12,
  createdAt: 1628693855675.0,
  currency: { id: CURRENCY.GBP },
  details: ['RESOLVING'],
  detailsOther: '',
  interestPercentage: 24,
  monthsOfCover: 10,
  name: `mock ${CONSTANTS.DEALS.DEAL_TYPE.GEF} facility`,
  paymentType: null,
  shouldCoverStartOnSubmission: true,
  type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
  ukefExposure: 1481472,
  updatedAt: 1628770126497.0,
  value: 123456,
  ukefFacilityId: '1234567890',
  guaranteeFee: 10.8,
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  hasBeenIssued: true,
  submittedAsIssuedDate: Date.now(),
};

const BOND_FACILITY = {
  type: CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
  bondIssuer: 'Issuer',
  bondType: BOND_FACILITY_TYPE.ADVANCE_PAYMENT_GUARANTEE,
  facilityStage: 'Unissued',
  hasBeenIssued: false,
  ukefGuaranteeInMonths: '10',
  bondBeneficiary: 'test',
  guaranteeFeePayableByBank: '9.0000',
  value: '12345.00',
  currencySameAsSupplyContractCurrency: 'true',
  riskMarginFee: '10',
  coveredPercentage: '20',
  minimumRiskMarginFee: '30',
  ukefExposure: '2,469.00',
  feeType: 'At maturity',
  feeFrequency: '12',
  dayCountBasis: '365',
  currency: {
    text: 'GBP - UK Sterling',
    id: CURRENCY.GBP,
  },
  'coverEndDate-day': '20',
  'coverEndDate-month': '10',
  'coverEndDate-year': '2020',
  name: `mock ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS} facility`,
  submittedAsIssuedDate: Date.now(),
  requestedCoverStartDate: '1606900616652',
  ukefFacilityId: '1234567890',
};

export default {
  CASH_FACILITY,
  BOND_FACILITY,
};
