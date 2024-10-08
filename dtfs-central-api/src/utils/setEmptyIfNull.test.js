const setEmptyIfNull = require('./setEmptyIfNull');

describe('Checking empty value function used for sorting', () => {
  it('Should return blank value for null input', () => {
    expect(setEmptyIfNull(null)).toEqual('');
  });

  describe('Should return blank value for undefined input', () => {
    expect(setEmptyIfNull(undefined)).toEqual('');
  });

  it('Should return same value as input', () => {
    expect(setEmptyIfNull('UKEF')).toEqual('UKEF');
  });
});
