const dealHasAllUkefIds = require('./dealHasAllUkefIds');
const MOCK_DEAL = require('../__mocks__/mock-deal-MIN-second-submit-facilities-unissued-to-issued');
const NO_UKEF_ID_MOCK_DEAL = require('../__mocks__/mock-deal-no-ukef-id');

describe('dealHasAllUkefIds()', () => {
  it('Should return TRUE as deal and the facility have UKEF IDs', () => {
    expect(await dealHasAllUkefIds(MOCK_DEAL._id)).toEqual(true);
  });
  it('Should return FALSE as deal and the facility does not have UKEF IDs', () => {
    expect(await dealHasAllUkefIds(NO_UKEF_ID_MOCK_DEAL._id)).toEqual(false);
  });
});
