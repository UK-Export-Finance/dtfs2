const { isFacilityComplete } = require('./dealFormsCompleted');
const CONSTANTS = require('../constants');

describe('isFacilityComplete', () => {
  it('should return true when facility has no items', () => {
    const facility = {
      items: [],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(true);
  });

  it('should return true when facility is undefined', () => {
    const facility = undefined;

    const result = isFacilityComplete(facility);

    expect(result).toBe(true);
  });

  it('should return true when facility is complete', () => {
    const facility = {
      items: [
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
      ],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(true);
  });

  it('should return false when facility is incomplete', () => {
    const facility = {
      items: [
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.FACILITY.INCOMPLETE },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
      ],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(true);
  });

  it('should return false when facility has acknowledged items but not all are complete', () => {
    const facility = {
      items: [
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
      ],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(false);
  });

  it('should return false when facility has acknowledged items and all are complete with missing properties', () => {
    const facility = {
      items: [
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF },
      ],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(false);
  });

  it('should return false when facility has acknowledged items but not all have requestedCoverStartDate and coverDateConfirmed', () => {
    const facility = {
      items: [
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: '2022-01-01' },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
      ],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(false);
  });

  it('should return true when facility has acknowledged items and all have requestedCoverStartDate and coverDateConfirmed', () => {
    const facility = {
      items: [
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: '2022-01-01', coverDateConfirmed: true },
        { status: CONSTANTS.STATUS.FACILITY.COMPLETED },
        { status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF, requestedCoverStartDate: '2022-01-01', coverDateConfirmed: true },
      ],
    };

    const result = isFacilityComplete(facility);

    expect(result).toBe(true);
  });
});
