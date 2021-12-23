const dealHasAllUkefIds = require('./dealHasAllUkefIds');
const MOCK_DEAL = require('../__mocks__/mock-deal-MIN-second-submit-facilities-unissued-to-issued');

describe('dealHasAllUkefIds()', () => {
  it('Should return TRUE as deal and the facility have UKEF IDs', () => {
    expect(dealHasAllUkefIds(MOCK_DEAL._id)).toEqual(true);
  });
});
