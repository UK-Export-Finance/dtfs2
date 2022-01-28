const CONSTANTS = require('../../../src/constants');

const baseFacilities = {
  name: null,
  coverStartDate: null,
  coverEndDate: null,
  monthsOfCover: null,
  details: null,
  detailsOther: null,
  currency: null,
  value: null,
  coverPercentage: null,
  interestPercentage: null,
  paymentType: null,
};

const mockFacilities = [
  {
    type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: null,
    ...baseFacilities,
  },
  {
    type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: true,
    canResubmitIssuedFacilities: null,
    ...baseFacilities,
  }, {
    type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
    hasBeenIssued: false,
    shouldCoverStartOnSubmission: null,
    ...baseFacilities,
  }, {
    type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: null,
    ...baseFacilities,
  }, {
    type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: true,
    canResubmitIssuedFacilities: true,
    issueDate: '2021-12-01T12:32:00.000+00:00',
    ukefFacilityId: '123',
    unissuedToIssuedByMaker: {
      firstname: 'Mister',
      surname: 'One',
      _id: '61e567d7db41bd65b00bd47a',
    },
    ...baseFacilities,
  },
  {
    type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
    hasBeenIssued: true,
    shouldCoverStartOnSubmission: true,
    canResubmitIssuedFacilities: true,
    issueDate: '2021-12-01T12:32:00.000+00:00',
    ukefFacilityId: '321',
    unissuedToIssuedByMaker: {
      firstname: 'Mister',
      surname: 'Two',
      _id: '61e567d7db41bd65b00bd47b',
    },
    ...baseFacilities,
  },
];

const facilityWithDealId = (dealId) => ({
  status: 'In progress',
  items: [{
    status: 'In progress',
    details: {
      dealId,
      type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
      hasBeenIssued: true,
      shouldCoverStartOnSubmission: true,
      canResubmitIssuedFacilities: true,
      issueDate: '2021-12-01T12:32:00.000+00:00',
      ukefFacilityId: '123',
      unissuedToIssuedByMaker: {
        firstname: 'Mister',
        surname: 'One',
        _id: '61e567d7db41bd65b00bd47a',
      },
      ...baseFacilities,
    },
  }],
});

module.exports = { mockFacilities, facilityWithDealId };
