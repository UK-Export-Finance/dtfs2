const { UNDERWRITING_SUPPORT, UNDERWRITER_MANAGERS, UNDERWRITERS, RISK_MANAGERS, BUSINESS_SUPPORT, PIM } = require('../../constants/teams');
const { allValidTeamIds } = require('./teams');

describe('allValidTeams', () => {
  it('returns all valid team ids', () => {
    expect(allValidTeamIds()).toStrictEqual([UNDERWRITING_SUPPORT.id, UNDERWRITER_MANAGERS.id, UNDERWRITERS.id, RISK_MANAGERS.id, BUSINESS_SUPPORT.id, PIM.id]);
  });
});
