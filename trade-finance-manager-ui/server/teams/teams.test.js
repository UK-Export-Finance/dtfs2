const { UNDERWRITING_SUPPORT, UNDERWRITER_MANAGERS, UNDERWRITERS, RISK_MANAGERS, BUSINESS_SUPPORT, PIM } = require('../constants/teams');
const { allValidTeamIds } = require('./teams');

describe('allValidTeams', () => {
  it('returns all valid team ids', () => {
    expect(allValidTeamIds()).toStrictEqual([
      UNDERWRITING_SUPPORT,
      UNDERWRITER_MANAGERS,
      UNDERWRITERS,
      RISK_MANAGERS,
      BUSINESS_SUPPORT,
      PIM,
    ]);
  });
});
