import { decimalsCount } from './decimals-count';

describe('decimalsCount', () => {
  it('should return amount of decimals', () => {
    expect(decimalsCount(12.1)).toEqual(1);
    expect(decimalsCount(12.12345678)).toEqual(8);
  });

  it('should return 0 when no decimals', () => {
    expect(decimalsCount(1)).toEqual(0);
    expect(decimalsCount(1000)).toEqual(0);
  });
});
