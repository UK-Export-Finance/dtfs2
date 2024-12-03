const { FACILITY_TYPE, FACILITY_STATUS } = require('@ukef/dtfs2-common');
const { isEveryFacilityComplete } = require('./dealFormsCompleted');
const CONSTANTS = require('../constants');

describe('isEveryFacilityComplete', () => {
  it('should return false when facilities has no items', () => {
    const facilities = [];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when facilities is undefined', () => {
    const facilities = undefined;

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when all facilities are incomplete', () => {
    const facilities = [{ status: FACILITY_STATUS.INCOMPLETE }, { status: FACILITY_STATUS.INCOMPLETE }, { status: FACILITY_STATUS.INCOMPLETE }];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when all facilities are not started', () => {
    const facilities = [{ status: FACILITY_STATUS.NOT_STARTED }, { status: FACILITY_STATUS.NOT_STARTED }, { status: FACILITY_STATUS.NOT_STARTED }];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when all facilities are not started and are incomplete', () => {
    const facilities = [
      { status: FACILITY_STATUS.NOT_STARTED },
      { status: FACILITY_STATUS.NOT_STARTED },
      { status: FACILITY_STATUS.NOT_STARTED },
      { status: FACILITY_STATUS.INCOMPLETE },
      { status: FACILITY_STATUS.INCOMPLETE },
      { status: FACILITY_STATUS.INCOMPLETE },
    ];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return true when atleast one facility is completed', () => {
    const facilities = [{ status: FACILITY_STATUS.NOT_STARTED }, { status: FACILITY_STATUS.COMPLETED }, { status: FACILITY_STATUS.NOT_STARTED }];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(true);
  });

  it('should return true when facilities is complete', () => {
    const facilities = [{ status: FACILITY_STATUS.COMPLETED }, { status: FACILITY_STATUS.COMPLETED }, { status: FACILITY_STATUS.COMPLETED }];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(true);
  });

  it('should return false when a single facility is incomplete', () => {
    const facilities = [{ status: FACILITY_STATUS.COMPLETED }, { status: FACILITY_STATUS.INCOMPLETE }, { status: FACILITY_STATUS.COMPLETED }];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when multiple facilities are in `Incomplete` status', () => {
    const facilities = [
      { status: FACILITY_STATUS.COMPLETED },
      {
        status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
        requestedCoverStartDate: '2022-01-01',
        coverDateConfirmed: true,
      },
      { status: FACILITY_STATUS.COMPLETED },
      {
        status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
        requestedCoverStartDate: '2022-01-01',
        coverDateConfirmed: true,
      },
      { status: FACILITY_STATUS.INCOMPLETE, type: FACILITY_TYPE.BOND },
      { status: FACILITY_STATUS.INCOMPLETE, type: FACILITY_TYPE.LOAN },
      { status: FACILITY_STATUS.INCOMPLETE, type: FACILITY_TYPE.CASH },
      { status: FACILITY_STATUS.INCOMPLETE, type: FACILITY_TYPE.CONTINGENT },
    ];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when facilities has acknowledged items but not all are complete', () => {
    const facilities = [{ status: FACILITY_STATUS.COMPLETED }, { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED }, { status: FACILITY_STATUS.COMPLETED }];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when facilities has acknowledged items and all are complete with missing properties', () => {
    const facilities = [
      { status: FACILITY_STATUS.COMPLETED },
      { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED },
      { status: FACILITY_STATUS.COMPLETED },
      { status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF },
    ];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return false when facilities has acknowledged items but not all have requestedCoverStartDate and coverDateConfirmed', () => {
    const facilities = [
      { status: FACILITY_STATUS.COMPLETED },
      { status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, requestedCoverStartDate: '2022-01-01' },
      { status: FACILITY_STATUS.COMPLETED },
    ];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(false);
  });

  it('should return true when facilities has acknowledged items and all have requestedCoverStartDate and coverDateConfirmed', () => {
    const facilities = [
      { status: FACILITY_STATUS.COMPLETED },
      {
        status: CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED,
        requestedCoverStartDate: '2022-01-01',
        coverDateConfirmed: true,
      },
      { status: FACILITY_STATUS.COMPLETED },
      {
        status: CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF,
        requestedCoverStartDate: '2022-01-01',
        coverDateConfirmed: true,
      },
    ];

    const result = isEveryFacilityComplete(facilities);

    expect(result).toEqual(true);
  });
});
