import {
  pastDate,
  futureDateInRange,
  getFacilityCoverStartDate,
  getIssuedFacilitiesAsArray,
  coverDatesConfirmed,
  hasChangedToIssued,
  facilitiesChangedToIssuedAsArray,
  areUnissuedFacilitiesPresent,
  facilityIssueDeadline,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
} from './facility-helpers';

import {
  MOCK_AIN_APPLICATION,
  MOCK_AIN_APPLICATION_UNISSUED_ONLY,
  MOCK_AIN_APPLICATION_ISSUED_ONLY,
  MOCK_AIN_APPLICATION_RETURN_MAKER,
  MOCK_AIN_APPLICATION_FALSE_COMMENTS,
  MOCK_AIN_APPLICATION_CHECKER,
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

describe('pastDate', () => {
  it('Should return TRUE for the specified date', () => {
    expect(pastDate({ day: 1, month: 1, year: 1970 })).toEqual(true);
  });
  it('Should return TRUE for the specified date', () => {
    expect(pastDate({ day: 20, month: 9, year: 1989 })).toEqual(true);
  });
  it('Should return FALSE for the specified date', () => {
    const date = new Date();
    expect(pastDate({ day: date.getDate(), month: (date.getMonth() + 1), year: date.getFullYear() })).toEqual(false);
  });
});

describe('futureDateInRange', () => {
  it('Should return FALSE for the specified day and range days', () => {
    expect(futureDateInRange({ day: 1, month: 1, year: 1970 }, 30)).toEqual(false);
  });
  it('Should return FALSE for the specified day and range days', () => {
    expect(futureDateInRange({ day: 1, month: 1, year: 9999 }, 30)).toEqual(false);
  });
  it('Should return TRUE for the specified day and range days', () => {
    const date = new Date();
    expect(futureDateInRange({ day: date.getDate(), month: (date.getMonth() + 1), year: date.getFullYear() }, 365)).toEqual(true);
  });

  describe('getFacilityCoverStartDate', () => {
    it('Should return expected date object for mock facility', () => {
      const expected = {
        date: '2',
        month: '12',
        year: '2021',
      };
      expect(getFacilityCoverStartDate(MOCK_FACILITY.items[1])).toEqual(expected);
    });

    it('Should return expected date object for mock facility', () => {
      const expected = {
        date: '3',
        month: '12',
        year: '2021',
      };
      expect(getFacilityCoverStartDate(MOCK_FACILITY.items[0])).toEqual(expected);
    });
  });
});

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
  it('should return true if only unissued facilities', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION_UNISSUED_ONLY)).toEqual(true);
  });
  it('should return true if only unissued and issued facilities', () => {
    expect(areUnissuedFacilitiesPresent(MOCK_AIN_APPLICATION)).toEqual(true);
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
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION, MOCK_REQUEST, MOCK_ISSUED_FACILITY);

    expect(result).toEqual(true);
  });

  it('should return true when CHANGED_REQUIRED, maker, and has canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST, MOCK_ISSUED_FACILITY);

    expect(result).toEqual(true);
  });

  it('should return false when DRAFT, maker, and has no canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION_FALSE_COMMENTS, MOCK_REQUEST, MOCK_FACILITY);

    expect(result).toEqual(false);
  });

  it('should return false when CHECKER, maker, and has canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION_CHECKER, MOCK_REQUEST, MOCK_ISSUED_FACILITY);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and has  no canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION, MOCK_REQUEST, MOCK_ISSUED_FACILITY_UNCHANGED);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and has no canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST, MOCK_ISSUED_FACILITY_UNCHANGED);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, checker, and has canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION, MOCK_REQUEST_CHECKER, MOCK_ISSUED_FACILITY);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, checker, and has canResubmitIssuedFacilities', () => {
    const result = summaryIssuedChangedToIssued(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST_CHECKER, MOCK_ISSUED_FACILITY);

    expect(result).toEqual(false);
  });
});

describe('summaryIssuedUnchanged()', () => {
  it('should return true when UKEF_ACKNOWLEDGED, maker, facility unissued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION, MOCK_REQUEST, MOCK_UNISSUED_FACILITY, changed);

    expect(result).toEqual(true);
  });

  it('should return true when CHANGED_REQUIRED, maker, facility unissued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST, MOCK_UNISSUED_FACILITY, changed);

    expect(result).toEqual(true);
  });

  it('should return false when DRAFT, maker, facility unissued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION_FALSE_COMMENTS, MOCK_REQUEST, MOCK_UNISSUED_FACILITY, changed);

    expect(result).toEqual(false);
  });

  it('should return false when CHECKER, maker, and facilty not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION_CHECKER, MOCK_REQUEST, MOCK_ISSUED_FACILITY, changed);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and facilty not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_ISSUED_ONLY);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION, MOCK_REQUEST, MOCK_ISSUED_FACILITY_UNCHANGED, changed);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and facilty not issued and has no canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION_ISSUED_ONLY);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST, MOCK_ISSUED_FACILITY_UNCHANGED, changed);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, maker, and facilty issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION, MOCK_REQUEST, MOCK_ISSUED_FACILITY, changed);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, maker, and facilty issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST, MOCK_ISSUED_FACILITY, changed);

    expect(result).toEqual(false);
  });

  it('should return false when UKEF_ACKNOWLEDGED, checker, and facilty not issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION, MOCK_REQUEST_CHECKER, MOCK_UNISSUED_FACILITY, changed);

    expect(result).toEqual(false);
  });

  it('should return false when CHANGED_REQUIRED, checker, and facilty not issued and has canResubmitIssuedFacilities facilities', () => {
    const changed = facilitiesChangedToIssuedAsArray(MOCK_AIN_APPLICATION);
    const result = summaryIssuedUnchanged(MOCK_AIN_APPLICATION_RETURN_MAKER, MOCK_REQUEST_CHECKER, MOCK_UNISSUED_FACILITY, changed);

    expect(result).toEqual(false);
  });
});
