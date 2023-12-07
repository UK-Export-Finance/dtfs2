/**
 * Nunjucks filter to tell whether or not a user
 * is in a specific team by the team id
 * @param {object} user - The user object
 * @param {import('../types/teamIds').TeamId} teamId - The teamId
 * @returns {boolean}
 */
const userIsInTeam = (user, teamId) => user.teams !== undefined && user.teams.some(({ id }) => teamId === id);

module.exports = userIsInTeam;
