const CONSTANTS = require('../gef/cypress/fixtures/constants');
const dateConstants = require('./dateConstants');

/**
 * Gets facility end date properties if enabled on default deal version
 * @param {{ facilityEndDateEnabled?: boolean}} options
 * @returns {Pick<import('@ukef/dtfs2-common').Facility,'isUsingFacilityEndDate' | 'facilityEndDate'> | {} } mock facility end date properties if enabled, or empty object if not
 */
const getFacilityEndDateProperties = ({ facilityEndDateEnabled }) => {
  if (facilityEndDateEnabled) {
    return {
      isUsingFacilityEndDate: true,
      facilityEndDate: new Date(1830297600000),
    };
  }
  return {};
};

/**
 * @param {{ facilityEndDateEnabled?: boolean}} options
 * @returns {import('@ukef/dtfs2-common').Facility }
 */
const anUnissuedCashFacility = ({ facilityEndDateEnabled = false } = {}) => ({
  ...getFacilityEndDateProperties({ facilityEndDateEnabled }),
  type: CONSTANTS.FACILITY_TYPE.CASH,
  hasBeenIssued: false,
  name: 'Facility one',
  shouldCoverStartOnSubmission: true,
  coverStartDate: 1638403200000,
  coverEndDate: '2030-01-01T00:00:00.000Z',
  monthsOfCover: 20,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: '1638363717231',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  ukefFacilityId: '10000011',
  dayCountBasis: 365,
  coverDateConfirmed: null,
  canResubmitIssuedFacilities: null,
});

exports.anUnissuedCashFacility = anUnissuedCashFacility;

/**
 * @param {{ facilityEndDateEnabled?: boolean}} options
 * @returns {import('@ukef/dtfs2-common').Facility }
 */
const anIssuedCashFacility = ({ facilityEndDateEnabled = false } = {}) => ({
  ...getFacilityEndDateProperties({ facilityEndDateEnabled }),
  type: CONSTANTS.FACILITY_TYPE.CASH,
  hasBeenIssued: true,
  name: 'Facility two',
  shouldCoverStartOnSubmission: true,
  coverStartDate: 1638403200000,
  coverEndDate: '2030-01-01T00:00:00.000Z',
  monthsOfCover: null,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: '1638363717231',
  ukefFacilityId: '10000012',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: true,
  canResubmitIssuedFacilities: null,
});

/**
 * @param {{ facilityEndDateEnabled?: boolean}} options
 * @returns {import('@ukef/dtfs2-common').Facility }
 */
const anIssuedCashFacilityWithCoverDateConfirmed = ({ facilityEndDateEnabled = false } = {}) => ({
  ...getFacilityEndDateProperties({ facilityEndDateEnabled }),
  type: CONSTANTS.FACILITY_TYPE.CASH,
  hasBeenIssued: true,
  name: 'Facility two',
  shouldCoverStartOnSubmission: true,
  coverStartDate: 1638403200000,
  coverEndDate: dateConstants.tomorrow,
  monthsOfCover: null,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: null,
  ukefFacilityId: '10000012',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: null,
  canResubmitIssuedFacilities: null,
});

exports.anIssuedCashFacilityWithCoverDateConfirmed = anIssuedCashFacilityWithCoverDateConfirmed;

/**
 * @param {{ facilityEndDateEnabled?: boolean}} options
 * @returns {import('@ukef/dtfs2-common').Facility }
 */
const anUnissuedContingentFacility = ({ facilityEndDateEnabled = false } = {}) => ({
  ...getFacilityEndDateProperties({ facilityEndDateEnabled }),
  type: CONSTANTS.FACILITY_TYPE.CONTINGENT,
  hasBeenIssued: false,
  name: 'Facility three',
  shouldCoverStartOnSubmission: true,
  coverStartDate: 1638403200000,
  coverEndDate: '2030-01-01T00:00:00.000Z',
  monthsOfCover: 30,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: '1638363717231',
  ukefFacilityId: '10000013',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: false,
  canResubmitIssuedFacilities: null,
});

/**
 * @param {{ facilityEndDateEnabled?: boolean}} options
 * @returns {import('@ukef/dtfs2-common').Facility }
 */
const anUnissuedCashFacilityWith20MonthsOfCover = ({ facilityEndDateEnabled = false } = {}) => ({
  ...getFacilityEndDateProperties({ facilityEndDateEnabled }),
  type: CONSTANTS.FACILITY_TYPE.CASH,
  hasBeenIssued: false,
  name: 'Facility four',
  shouldCoverStartOnSubmission: true,
  coverStartDate: 1638403200000,
  coverEndDate: '2030-01-01T00:00:00.000Z',
  monthsOfCover: 6,
  details: [
    'Term basis',
    'Revolving or renewing basis',
    'Committed basis',
    'Uncommitted basis',
    'On demand or overdraft basis',
    'Factoring on a  with-recourse basis',
    'Other',
  ],
  detailsOther: 'Other',
  currency: { id: 'GBP' },
  value: 2000,
  coverPercentage: 80,
  interestPercentage: 1,
  paymentType: 'IN_ADVANCE_MONTHLY',
  createdAt: 1638363596947,
  updatedAt: 1638442632540,
  ukefExposure: 1600,
  guaranteeFee: 0.9,
  submittedAsIssuedDate: '1638363717231',
  ukefFacilityId: '10000014',
  feeType: 'In advance',
  feeFrequency: 'Monthly',
  dayCountBasis: 365,
  coverDateConfirmed: false,
  canResubmitIssuedFacilities: null,
});

exports.multipleMockGefFacilities = ({ facilityEndDateEnabled }) => ({
  unissuedCashFacility: anUnissuedCashFacility({ facilityEndDateEnabled }),
  issuedCashFacility: anIssuedCashFacility({ facilityEndDateEnabled }),
  unissuedContingentFacility: anUnissuedContingentFacility({ facilityEndDateEnabled }),
  unissuedCashFacilityWith20MonthsOfCover: anUnissuedCashFacilityWith20MonthsOfCover({ facilityEndDateEnabled }),
});
