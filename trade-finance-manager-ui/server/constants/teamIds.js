const PDC_TEAM_IDS = require('./pdcTeamIds');

const UNDERWRITING_SUPPORT = 'UNDERWRITING_SUPPORT';
const UNDERWRITER_MANAGERS = 'UNDERWRITER_MANAGERS';
const UNDERWRITERS = 'UNDERWRITERS';
const RISK_MANAGERS = 'RISK_MANAGERS';
const BUSINESS_SUPPORT = 'BUSINESS_SUPPORT';
const PIM = 'PIM';

/**
 * @typedef {import('../types/teamIds').TeamId} TeamId
 */

/**
 * @type {Record<TeamId, TeamId>}
 */
module.exports = {
  UNDERWRITING_SUPPORT,
  UNDERWRITER_MANAGERS,
  UNDERWRITERS,
  RISK_MANAGERS,
  BUSINESS_SUPPORT,
  PIM,
  ...PDC_TEAM_IDS,
};
