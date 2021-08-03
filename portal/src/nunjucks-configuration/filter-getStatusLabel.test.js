import getStatusLabel from './filter-getStatusLabel';

describe('getStatusLabel filter', () => {
  it('returns the expected label for a give application status', () => {
    expect(getStatusLabel('BANK_CHECK')).toEqual('Ready for Checker\'s approval');
  });

  it('returns the status passed if no matching status is found', () => {
    expect(getStatusLabel('NOSTATUS')).toEqual('NOSTATUS');
    expect(getStatusLabel()).toEqual(undefined);
  });
});
