import { ADMIN, CHECKER, MAKER } from '../constants/roles';
import { isChecker } from './isChecker.helper';

describe('isChecker', () => {
  it('should return `true` when the role is `checker`', () => {
    const roles = [CHECKER];
    expect(isChecker(roles)).toEqual(true);
  });

  it('should return `false` when the role is `maker`', () => {
    const roles = [MAKER];
    expect(isChecker(roles)).toEqual(false);
  });

  it('should return `false` when the role is `maker/checker`', () => {
    const roles = [MAKER, CHECKER];
    expect(isChecker(roles)).toEqual(false);
  });

  it('should return `false` when the role is `admin`', () => {
    const roles = [ADMIN];
    expect(isChecker(roles)).toEqual(false);
  });

  it('should return `false` when the role is `unknown`', () => {
    const roles = ['unknown'];
    expect(isChecker(roles)).toEqual(false);
  });
});
