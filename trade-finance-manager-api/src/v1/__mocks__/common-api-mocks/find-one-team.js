const api = require('../../api');
const MOCK_TEAMS = require('../mock-teams');

export const mockFindOneTeam = () => {
  api.findOneTeam.mockImplementation((teamId) => MOCK_TEAMS.find((team) => team.id === teamId));
};
