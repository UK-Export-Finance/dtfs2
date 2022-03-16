import { isChecker } from './isChecker.helper';

describe('isChecker', () => {
  it('should return `true` when the role is `checker`', () => {
    const roles = ['checker'];
    expect(isChecker(roles)).toEqual(true);
  });

  it('should return `false` when the role is `maker`', () => {
    const roles = ['maker'];
    expect(isChecker(roles)).toEqual(false);
  });

  it('should return `false` when the role is `maker/checker`', () => {
    const roles = ['maker', 'checker'];
    expect(isChecker(roles)).toEqual(false);
  });

  it('should return `false` when the role is `admin`', () => {
    const roles = ['admin'];
    expect(isChecker(roles)).toEqual(false);
  });

  it('should return `false` when the role is `unknown`', () => {
    const roles = ['unknown'];
    expect(isChecker(roles)).toEqual(false);
  });
});
