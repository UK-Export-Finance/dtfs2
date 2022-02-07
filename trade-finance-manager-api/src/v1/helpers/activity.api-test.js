const {
  labelCase,
  getLabel,
  getTimestamp,
  getDescription,
  getAuthor,
} = require('./activity');

const MOCK_TFM_GEF_AIN_DEAL = require('../__mocks__/mock-TFM-deal-AIN-submitted');

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
  it('Should return label case for specified string', () => {
    expect(labelCase('facility')).toEqual('Facility');
  });

  it('Should return label case for specified string', () => {
    expect(labelCase('Automatic Inclusion Notice')).toEqual('Automatic inclusion notice');
  });

  it('Should return label case for specified string', () => {
    expect(labelCase('Automatic Inclusion Notice')).not.toEqual('Automatic Inclusion Notice');
  });
});

describe('getTimestamp()', () => {
  it('Should return epoch timestamp without milliseconds', () => {
    expect(getTimestamp(mockDealRecord)).toEqual(1643629694);
  });
  it('Should return epoch timestamp without milliseconds', () => {
    expect(getTimestamp(mockDealRecord)).not.toEqual(1643629694000);
  });
});

describe('getLabel()', () => {
  it('Should return AIN deal label', () => {
    expect(getLabel(mockDealRecord, MOCK_TFM_GEF_AIN_DEAL)).toEqual('Automatic inclusion notice submitted');
  });

  it('Should return AIN deal label', () => {
    expect(getLabel(mockDealRecord, MOCK_TFM_GEF_AIN_DEAL)).not.toEqual('Automatic Inclusion Notice submitted');
  });

  it('Should return facility label', () => {
    expect(getLabel(mockFacilityRecord, MOCK_TFM_GEF_AIN_DEAL)).toEqual('Facility submitted');
  });
});

describe('getAuthor()', () => {
  it('Should return author object', () => {
    const mockAuthor = {
      firstName: 'UKEF test bank (Delegated)',
      lastName: '9',
      _id: '',
    };
    expect(getAuthor(MOCK_TFM_GEF_AIN_DEAL)).toEqual(mockAuthor);
  });
});

describe('getDescription()', () => {
  it('Should return checker\'s latest comment', () => {
    expect(getDescription(mockDealRecord, MOCK_TFM_GEF_AIN_DEAL)).toEqual('123123');
  });

  it('Should return empty string as no comment has been submitted by the checker', () => {
    const mockDealNoComments = MOCK_TFM_GEF_AIN_DEAL;
    mockDealNoComments.dealSnapshot.comments = [];
    expect(getDescription(mockDealRecord, mockDealNoComments)).toEqual('');
  });

  it('Should return empty string for facility record', () => {
    expect(getDescription(mockFacilityRecord, MOCK_TFM_GEF_AIN_DEAL)).toEqual('');
  });
});
