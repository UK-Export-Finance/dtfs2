import { PORTAL_AMENDMENT_STATUS } from '../constants';
import { amendmentStatusTagColour } from './amendment-status-tag-colour';

describe('amendmentStatusTagColour', () => {
  it('should return "blue" for READY_FOR_CHECKERS_APPROVAL status', () => {
    const status = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
    const result = amendmentStatusTagColour(status);
    expect(result).toBe('blue');
  });

  it('should return "blue" for FURTHER_MAKERS_INPUT_REQUIRED status', () => {
    const status = PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;
    const result = amendmentStatusTagColour(status);
    expect(result).toBe('blue');
  });

  it('should return "green" for ACKNOWLEDGED status', () => {
    const status = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;
    const result = amendmentStatusTagColour(status);
    expect(result).toBe('green');
  });

  it('should return "grey" for any other status', () => {
    const status = 'UNKNOWN_STATUS';

    // Simulating an unknown status
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = amendmentStatusTagColour(status as any);
    expect(result).toBe('grey');
  });
});
