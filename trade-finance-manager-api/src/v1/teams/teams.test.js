const TEAMS = require('../../constants/teams');
const { allValidTeamIds } = require('./teams');

describe('allValidTeams', () => {
  it('returns all valid team ids', () => {
    const expectedResult = Object.values(TEAMS).map((team) => team.id);

    expect(allValidTeamIds()).toStrictEqual(expectedResult);
  });
});
