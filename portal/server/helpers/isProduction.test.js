import { isProduction } from '.';

describe('helpers/isProduction', () => {
  it('should return false when NODE_ENV is set to "development"', () => {
    process.env.NODE_ENV = 'development';
    expect(isProduction()).toBe(false);
  });

  it('should return false when NODE_ENV is set to "development"', () => {
    process.env.NODE_ENV = 'staging';
    expect(isProduction()).toBe(false);
  });

  it('should return false when NODE_ENV is not set', () => {
    delete process.env.NODE_ENV;
    expect(isProduction()).toBe(false);
  });

  it('should return false when NODE_ENV is set to an unexpected value', () => {
    process.env.NODE_ENV = 'invalid';
    expect(isProduction()).toBe(false);
  });

  it('should return false when NODE_ENV is set to an blank value', () => {
    process.env.NODE_ENV = '';
    expect(isProduction()).toBe(false);
  });
});
