const {
  labelCase,
  getLabel,
  getTimestamp,
  getDescription,
  getAuthor,
  add,
} = require('./activity');

const MOCK_GEF_AIN_DEAL = require('../__mocks__/mock-gef-deal');

const mockDealRecord = {
  dealIdentifier: '1234',
  receivedFromACBS: '2022-01-31T11:48:14+00:00',
  submittedToACBS: '2022-01-31T11:48:10+00:00',
};

const mockFacilityRecord = {
  submittedToACBS: '2022-01-31T11:48:20+00:00',
  receivedFromACBS: '2022-01-31T11:48:23+00:00',
  facilityIdentifier: '0030181783',
};

describe('labelCase()', () => {
  it('Shoule return label case for specified string', () => {
    expect(labelCase('facility')).toEqual('Facility');
  });

  it('Shoule return label case for specified string', () => {
    expect(labelCase('Automatic Inclusion Notice')).toEqual('Automatic inclusion notice');
  });

  it('Shoule return label case for specified string', () => {
    expect(labelCase('Automatic Inclusion Notice')).not.toEqual('Automatic Inclusion Notice');
  });
});

describe('getTimestamp()', () => {
  it('Shoule return epoch timestamp without milliseconds', () => {
    expect(getTimestamp(mockDealRecord)).toEqual(1643629694);
  });
  it('Shoule return epoch timestamp without milliseconds', () => {
    expect(getTimestamp(mockDealRecord)).not.toEqual(1643629694000);
  });
});
