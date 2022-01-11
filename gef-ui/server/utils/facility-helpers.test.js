import {
  getIssuedFacilitiesAsArray,
  coverDatesConfirmed,
  hasChangedToIssued,
  facilitiesChangedToIssuedAsArray,
  areUnissuedFacilitiesPresent,
  facilityIssueDeadline,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
  checkCoverDateConfirmed,
} from './facility-helpers';

import {
  MOCK_AIN_APPLICATION,
  MOCK_AIN_APPLICATION_UNISSUED_ONLY,
  MOCK_AIN_APPLICATION_ISSUED_ONLY,
  MOCK_AIN_APPLICATION_RETURN_MAKER,
  MOCK_AIN_APPLICATION_FALSE_COMMENTS,
  MOCK_AIN_APPLICATION_CHECKER,
  MOCK_AIN_APPLICATION_GENERATOR,
} from './mocks/mock_applications';

import {
  MOCK_ISSUED_FACILITY,
  MOCK_FACILITY,
  MOCK_ISSUED_FACILITY_UNCHANGED,
  MOCK_UNISSUED_FACILITY,
} from './mocks/mock_facilities';

import {
  MOCK_REQUEST, MOCK_REQUEST_CHECKER,
} from './mocks/mock_requests';

const CONSTANTS = require('../constants');

const acceptableStatus = [
  CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
  CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
];
const acceptableRole = [
  'maker',
];
const mockParam = {
  acceptableStatus,
  acceptableRole,
  user: MOCK_REQUEST,
};

describe('getIssuedFacilitiesAsArray', () => {
  it('Should return the expected facilities object from mock facilities array where the facility date has not been confirmed by the bank', () => {
    const expected = [
      [
        { text: 'Facility one' },
        { text: '0030113306' },
        { text: 'GBP 1,000.00' },
        { html: "<a href = '/gef/application-details/61a7710b2ae62b0013dae687/61a7714f2ae62b0013dae689/confirm-cover-start-date' class = 'govuk-button govuk-button--secondary govuk-!-margin-0'>Update</a>" },
      ],
    ];
    expect(getIssuedFacilitiesAsArray(MOCK_FACILITY)).toEqual(expected);
  });

  it('Should return the empty array', () => {
    const expected = [];
    MOCK_FACILITY.items[0].details.hasBeenIssued = false;
    expect(getIssuedFacilitiesAsArray(MOCK_FACILITY)).toEqual(expected);
  });
});

describe('coverDatesConfirmed', () => {
  it('Should return FALSE as one of the facility\'s cover date has not been confirmed', () => {
    MOCK_FACILITY.items[0].details.hasBeenIssued = true;
    expect(coverDatesConfirmed(MOCK_FACILITY)).toEqual(false);
  });
});

describe('hasChangedToIssued()', () => {
  it('should return true when there are facilities changed to issued', () => {
    expect(hasChangedToIssued(MOCK_AIN_APPLICATION)).toEqual(true);
  });
  it('should return false when there are no facilities changed to issued', () => {
    expect(hasChangedToIssued(MOCK_AIN_APPLICATION_UNISSUED_ONLY)).toEqual(false);
  });
});

describe('facilitiesChangedToIssuedAsArray()', () => {
  it('should return an array when there are facilities changed to issued', () => {
    const result = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);

    const expected = [
      {
        name: MOCK_AIN_APPLICATION.facilities.items[1].details.name,
        id: MOCK_AIN_APPLICATION.facilities.items[1].details._id,
      },
    ];
    expect(result).toEqual(expected);
  });
  it('should return an empty array when there are no facilities changed to issued', () => {
    const result = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_UNISSUED_ONLY);

    const expected = [];
    expect(result).toEqual(expected);
  });
});

describe('areUnissuedFacilitiesPresent', () => {
  it('should return false if no unissued facilities', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_ISSUED_ONLY)).toEqual(false);
  });

  it('should return true if only unissued facilities and UKEF_ACKNOWLEDGED', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_UNISSUED_ONLY)).toEqual(true);
  });

  it('should return true if unissued and issued facilities and UKEF_ACKNOWLEDGED', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION)).toEqual(true);
  });

  it('should return false if only unissued and issued facilities and not UKEF_ACKNOWLEDGED, UKEF_APPROVED_WITHOUT_CONDITIONS and UKEF_APPROVED_WITH_CONDITIONS', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.DRAFT, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)))
      .toEqual(false);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_REFUSED,
      CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)))
      .toEqual(false);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF,
      CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)))
      .toEqual(false);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_IN_PROGRESS,
      CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)))
      .toEqual(false);
  });

  it('should return `TRUE` application status is either UKEF_ACKNOWLEDGED, UKEF_APPROVED_WITHOUT_CONDITIONS and UKEF_APPROVED_WITH_CONDITIONS and is MIA', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
      CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)))
      .toEqual(true);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
      CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)))
      .toEqual(true);
  });

  it('should return true if only unissued and issued facilities and not MIN, MIA and AIN', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
      CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)))
      .toEqual(true);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
      CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)))
      .toEqual(true);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
      CONSTANTS.DEAL_SUBMISSION_TYPE.MIN)))
      .toEqual(true);
  });
});

describe('facilityIssueDeadline()', () => {
  const timestamp = 1639586124100;

  it('should return a correct timestamp 3 months in advance in the right format', () => {
    const result = facilityIssueDeadline(timestamp);

    const expected = '15 Mar 2022';

    expect(result).toEqual(expected);
  });

  it('should return null when there is no submissionDate', () => {
    const result = facilityIssueDeadline();

    expect(result).toEqual(null);
  });
});

describe('summaryIssuedChangedToIssued()', () => {
  it('should return true when UKEF_ACKNOWLEDGED, maker, and has canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(true);
  });

  it('should return true when CHANGED_REQUIRED, maker, and has canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(true);
  });

  it('should return false when DRAFT, maker, and has no canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION_FALSE_COMMENTS;
    mockParam.data = MOCK_FACILITY;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHECKER, maker, and has canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION_CHECKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and has  no canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY_UNCHANGED;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and has no canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY_UNCHANGED;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, checker, and has canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.user = MOCK_REQUEST_CHECKER;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, checker, and has canResubmitIssuedFacilities', () => {
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.user = MOCK_REQUEST_CHECKER;
    const result = summaryIssuedChangedToIssued(mockParam);

    expect(result).toEqual(false);
  });
});

describe('summaryIssuedUnchanged()', () => {
  it('should return true when UKEF_ACKNOWLEDGED, maker, facility unissued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    mockParam.user = MOCK_REQUEST;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(true);
  });

  it('should return true when CHANGED_REQUIRED, maker, facility unissued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    mockParam.user = MOCK_REQUEST;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(true);
  });

  it('should return false when DRAFT, maker, facility unissued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_FALSE_COMMENTS;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHECKER, maker, and facilty not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_CHECKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and facilty not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_ISSUED_ONLY);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY_UNCHANGED;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and facilty not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_ISSUED_ONLY);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY_UNCHANGED;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and facilty issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and facilty issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, checker, and facilty not issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    mockParam.user = MOCK_REQUEST_CHECKER;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, checker, and facilty not issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    mockParam.user = MOCK_REQUEST_CHECKER;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });
});

describe('checkCoverDateConfirmed()', () => {
  it.only('Should return `0` when the application status is not DRAFT, type is AIN and have atleast one facility with issued status', async () => {
    expect(await checkCoverDateConfirmed(MOCK_AIN_APPLICATION_ISSUED_ONLY)).toEqual(0);
  });

  it.only('Should return `1` when the application status is DRAFT, type is AIN and have atleast one facility with issued status', async () => {
    const mockApplication = MOCK_AIN_APPLICATION_ISSUED_ONLY;
    mockApplication.status = CONSTANTS.DEAL_STATUS.DRAFT;
    expect(await checkCoverDateConfirmed(mockApplication)).toEqual(1);
  });

  it.only('Should return `0` when the application status is not DRAFT, type is MIA and have atleast one facility with issued status', async () => {
    const mockMIAApplication = MOCK_AIN_APPLICATION_ISSUED_ONLY;
    mockMIAApplication.status = CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED;
    mockMIAApplication.dealType = CONSTANTS.DEAL_SUBMISSION_TYPE.MIA;
    expect(await checkCoverDateConfirmed(mockMIAApplication)).toEqual(0);
  });

  it.only('Should return `0` when the application status is DRAFT, type is MIA and have atleast one facility with issued status', async () => {
    const mockMIAApplication = MOCK_AIN_APPLICATION_ISSUED_ONLY;
    mockMIAApplication.status = CONSTANTS.DEAL_STATUS.DRAFT;
    mockMIAApplication.submissionType = CONSTANTS.DEAL_SUBMISSION_TYPE.MIA;
    expect(await checkCoverDateConfirmed(mockMIAApplication)).toEqual(0);
  });

  it.only('Should return `0` when the application status is DRAFT, type is AIN and does not have an issued facility', async () => {
    const mockAINApplication = MOCK_AIN_APPLICATION_UNISSUED_ONLY;
    mockAINApplication.status = CONSTANTS.DEAL_STATUS.DRAFT;
    expect(await checkCoverDateConfirmed(mockAINApplication)).toEqual(0);
  });
});
