import { format, add } from 'date-fns';

import { PORTAL_AMENDMENT_STATUS, ROLES } from '@ukef/dtfs2-common';
import {
  getIssuedFacilitiesAsArray,
  coverDatesConfirmed,
  facilitiesChangedToIssuedAsArray,
  areUnissuedFacilitiesPresent,
  facilityIssueDeadline,
  formatIssueDeadlineDate,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
  issuedFacilityConfirmation,
  facilityTypeStringGenerator,
  isFacilityAmendmentInProgress,
} from './facility-helpers';

import {
  MOCK_AIN_APPLICATION,
  MOCK_AIN_APPLICATION_UNISSUED_ONLY,
  MOCK_AIN_APPLICATION_ISSUED_ONLY,
  MOCK_AIN_APPLICATION_RETURN_MAKER,
  MOCK_AIN_APPLICATION_FALSE_COMMENTS,
  MOCK_AIN_APPLICATION_CHECKER,
  MOCK_AIN_APPLICATION_GENERATOR,
  MOCK_MIA_APPLICATION_UNISSUED_ONLY,
  MOCK_APPLICATION_GENERATOR_SUBCOUNT,
} from './mocks/mock-applications';

import { MOCK_ISSUED_FACILITY, MOCK_FACILITY, MOCK_ISSUED_FACILITY_UNCHANGED, MOCK_UNISSUED_FACILITY } from './mocks/mock-facilities';

import { MOCK_REQUEST, MOCK_REQUEST_CHECKER } from './mocks/mock-requests';

const CONSTANTS = require('../constants');

const acceptableStatus = [
  CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
  CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
];
const acceptableRole = [ROLES.MAKER];
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
        {
          html: "<a href = '/gef/application-details/61a7710b2ae62b0013dae687/61a7714f2ae62b0013dae689/confirm-cover-start-date' class = 'govuk-button govuk-button--secondary govuk-!-margin-0' data-cy='update-coverStartDate-button-0'>Update</a>",
        },
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
  it("Should return FALSE as one of the facility's cover date has not been confirmed", () => {
    MOCK_FACILITY.items[0].details.hasBeenIssued = true;
    expect(coverDatesConfirmed(MOCK_FACILITY)).toEqual(false);
  });

  it('Should return FALSE as there are no issued facilities', () => {
    const noIssuedFacility = MOCK_FACILITY;
    noIssuedFacility.items[0].details.hasBeenIssued = true;
    noIssuedFacility.items[1].details.hasBeenIssued = true;
    noIssuedFacility.items[2].details.hasBeenIssued = true;
    expect(coverDatesConfirmed(noIssuedFacility)).toEqual(false);
  });

  it('Should return TRUE a facility has been issued and has coverStartConfirmed', () => {
    MOCK_FACILITY.items[0].details.hasBeenIssued = true;
    MOCK_FACILITY.items[0].details.coverDateConfirmed = true;
    expect(coverDatesConfirmed(MOCK_FACILITY)).toEqual(true);
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
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.DRAFT, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN))).toEqual(false);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_REFUSED, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN))).toEqual(false);

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN))).toEqual(
      false,
    );

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN))).toEqual(
      false,
    );

    expect(
      areUnissuedFacilitiesPresent(MOCK_APPLICATION_GENERATOR_SUBCOUNT(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN, 0)),
    ).toEqual(false);
  });

  it('should return `TRUE` application status is either CHANGES_REQUIRED and is MIA with submission count 1', () => {
    expect(
      areUnissuedFacilitiesPresent(MOCK_APPLICATION_GENERATOR_SUBCOUNT(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, CONSTANTS.DEAL_SUBMISSION_TYPE.MIA, 1)),
    ).toEqual(true);
  });

  it('should return `FALSE` application status is either CHANGES_REQUIRED and is MIA with submission count 0', () => {
    expect(
      areUnissuedFacilitiesPresent(MOCK_APPLICATION_GENERATOR_SUBCOUNT(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED, CONSTANTS.DEAL_SUBMISSION_TYPE.MIA, 0)),
    ).toEqual(false);
  });

  it('should return `TRUE` application status is either UKEF_ACKNOWLEDGED, UKEF_APPROVED_WITHOUT_CONDITIONS and UKEF_APPROVED_WITH_CONDITIONS and is MIA', () => {
    expect(
      areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)),
    ).toEqual(true);

    expect(
      areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)),
    ).toEqual(true);
  });

  it('should return true if only unissued and issued facilities and not MIN, MIA and AIN', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED, CONSTANTS.DEAL_SUBMISSION_TYPE.MIA))).toEqual(
      true,
    );

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED, CONSTANTS.DEAL_SUBMISSION_TYPE.AIN))).toEqual(
      true,
    );

    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_GENERATOR(CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED, CONSTANTS.DEAL_SUBMISSION_TYPE.MIN))).toEqual(
      true,
    );
  });
});

describe('facilityIssueDeadline()', () => {
  it('should return a correct timestamp 3 months in advance from submissionDate if AIN in the right format', () => {
    MOCK_AIN_APPLICATION.submissionDate = 1639586124100;
    const result = facilityIssueDeadline(MOCK_AIN_APPLICATION);

    const expected = '15 Mar 2022';

    expect(result).toEqual(expected);
  });

  it('should return a correct timestamp 3 months in advance from now if MIA in the right format', () => {
    const result = facilityIssueDeadline(MOCK_MIA_APPLICATION_UNISSUED_ONLY);

    const nowPlus3Months = add(new Date(), { months: 3 });
    const expected = format(nowPlus3Months, 'dd MMM yyyy');

    expect(result).toEqual(expected);
  });

  it('should return a correct timestamp 3 months in advance from MIN submission date if MIN in the right format', () => {
    const MOCK_MIN_APPLICATION = { ...MOCK_AIN_APPLICATION };
    MOCK_MIN_APPLICATION.submissionType = CONSTANTS.DEAL_SUBMISSION_TYPE.MIN;
    MOCK_MIN_APPLICATION.manualInclusionNoticeSubmissionDate = 1636373639000;

    const result = facilityIssueDeadline(MOCK_MIN_APPLICATION);

    const expected = '08 Feb 2022';

    expect(result).toEqual(expected);
  });

  it('should return null when there is no submissionDate', () => {
    MOCK_AIN_APPLICATION.submissionDate = null;
    const result = facilityIssueDeadline(MOCK_AIN_APPLICATION);

    expect(result).toEqual(null);
  });
});

describe('formatIssueDeadlineDate()', () => {
  it('should return a correct timestamp 3 months in advance in the right format from date if providing date', () => {
    MOCK_AIN_APPLICATION.submissionDate = 1639586124100;

    const date = new Date(parseInt(MOCK_AIN_APPLICATION.submissionDate, 10));
    const result = formatIssueDeadlineDate(date);

    const expected = '15 Mar 2022';

    expect(result).toEqual(expected);
  });

  it('should return a correct timestamp 3 months in advance from today if do not provide a date', () => {
    const result = formatIssueDeadlineDate();

    const nowPlus3Months = add(new Date(), { months: 3 });
    const expected = format(nowPlus3Months, 'dd MMM yyyy');

    expect(result).toEqual(expected);
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

  it('should return false when CHECKER, maker, and facility not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_CHECKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and facility not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_ISSUED_ONLY);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY_UNCHANGED;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and facility not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_ISSUED_ONLY);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY_UNCHANGED;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and facility issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and facility issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_ISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, checker, and facility not issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    mockParam.user = MOCK_REQUEST_CHECKER;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, checker, and facility not issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    mockParam.app = MOCK_AIN_APPLICATION_RETURN_MAKER;
    mockParam.data = MOCK_UNISSUED_FACILITY;
    mockParam.facilitiesChanged = changed;
    mockParam.user = MOCK_REQUEST_CHECKER;
    const result = summaryIssuedUnchanged(mockParam);

    expect(result).toEqual(false);
  });
});

describe('issuedFacilityConfirmation()', () => {
  it('Should return `false` as the facility has not been issued', () => {
    expect(issuedFacilityConfirmation(MOCK_AIN_APPLICATION_UNISSUED_ONLY)).toEqual(false);
  });
  it('Should return `false` as the submission type is AIN', () => {
    expect(issuedFacilityConfirmation(MOCK_AIN_APPLICATION_ISSUED_ONLY)).toEqual(false);
  });
  it('Should return `false` as the submission count is one', () => {
    expect(issuedFacilityConfirmation(MOCK_MIA_APPLICATION_UNISSUED_ONLY)).toEqual(false);
  });
  it('Should return `true` as the facility has been issued, application is MIN', () => {
    const mockMIN = {
      ...MOCK_AIN_APPLICATION,
      submissionType: CONSTANTS.DEAL_SUBMISSION_TYPE.MIN,
    };
    expect(issuedFacilityConfirmation(mockMIN)).toEqual(true);
  });
  it('Should return `true` as the facility has been issued, application is AIN', () => {
    expect(issuedFacilityConfirmation(MOCK_AIN_APPLICATION)).toEqual(true);
  });
});

describe('facilityTypeStringGenerator', () => {
  it('Should return `cash` for Cash facility', () => {
    expect(facilityTypeStringGenerator(CONSTANTS.FACILITY_TYPE.CASH)).toEqual('cash');
  });
  it('Should return `contingent` for Contingent facility', () => {
    expect(facilityTypeStringGenerator(CONSTANTS.FACILITY_TYPE.CONTINGENT)).toEqual('contingent');
  });
});

describe('isFacilityAmendmentInProgress', () => {
  it('should return false if the facility amendment is in draft', () => {
    // Arrange
    const mockApplication = {
      isPortalAmendmentInProgress: false,
      facilityIdWithAmendmentInProgress: '67f384b166041f835e52afe8',
      portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.DRAFT,
    };

    // Act
    const result = isFacilityAmendmentInProgress(mockApplication);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true if the facility amendment status is ready for checkers approval', () => {
    // Arrange
    const mockApplication = {
      isPortalAmendmentInProgress: true,
      facilityIdWithAmendmentInProgress: '67f384b166041f835e52afe8',
      portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
    };

    // Act
    const result = isFacilityAmendmentInProgress(mockApplication);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true if the facility amendment status is maker input required', () => {
    // Arrange
    const mockApplication = {
      isPortalAmendmentInProgress: true,
      facilityIdWithAmendmentInProgress: '67f384b166041f835e52afe8',
      portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
    };

    // Act
    const result = isFacilityAmendmentInProgress(mockApplication);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false if the amendment is acknowledged', () => {
    // Arrange
    const mockApplication = {
      isPortalAmendmentInProgress: false,
      facilityIdWithAmendmentInProgress: '67f384b166041f835e52afe8',
      portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
    };

    // Act
    const result = isFacilityAmendmentInProgress(mockApplication);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false if facility does not have any amendment in progress', () => {
    // Arrange
    const mockApplication = {};

    // Act
    const result = isFacilityAmendmentInProgress(mockApplication);

    // Assert
    expect(result).toBe(false);
  });
});
