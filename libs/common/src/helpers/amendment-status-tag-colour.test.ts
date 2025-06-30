import { PORTAL_AMENDMENT_STATUS, STATUS_TAG_COLOURS } from '../constants';
import { getAmendmentStatusTagColour } from './amendment-status-tag-colour';

describe('getAmendmentStatusTagColour', () => {
  it(`should return "${STATUS_TAG_COLOURS.BLUE}" for ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} status`, () => {
    const status = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
    const result = getAmendmentStatusTagColour(status);
    expect(result).toBe(STATUS_TAG_COLOURS.BLUE);
  });

  it(`should return "${STATUS_TAG_COLOURS.BLUE}" for ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} status`, () => {
    const status = PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;
    const result = getAmendmentStatusTagColour(status);
    expect(result).toBe(STATUS_TAG_COLOURS.BLUE);
  });

  it(`should return "${STATUS_TAG_COLOURS.GREEN}" for ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED} status`, () => {
    const status = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;
    const result = getAmendmentStatusTagColour(status);
    expect(result).toBe(STATUS_TAG_COLOURS.GREEN);
  });

  it(`should return "${STATUS_TAG_COLOURS.GREY}" for ${PORTAL_AMENDMENT_STATUS.DRAFT} status`, () => {
    const status = PORTAL_AMENDMENT_STATUS.DRAFT;
    const result = getAmendmentStatusTagColour(status);
    expect(result).toBe(STATUS_TAG_COLOURS.GREY);
  });

  it(`should return "${STATUS_TAG_COLOURS.GREY}" for any other status`, () => {
    const status = 'UNKNOWN_STATUS';

    // Simulating an unknown status
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = getAmendmentStatusTagColour(status as any);
    expect(result).toBe('grey');
  });
});
