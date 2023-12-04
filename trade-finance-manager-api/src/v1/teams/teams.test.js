const TEAMS = require('../../constants/teams');
const { getAllValidTeamIds } = require('./teams');

describe('getAllValidTeamIds', () => {
  it('returns all valid team ids', () => {
    const expectedResult = Object.values(TEAMS).map((team) => team.id);

    expect(getAllValidTeamIds()).toStrictEqual(expectedResult);
  });
});
