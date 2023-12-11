const PDC_READ = 'PDC_READ';
const PDC_RECONCILE = 'PDC_RECONCILE';

/**
 * @typedef {( 'PDC_READ' | 'PDC_RECONCILE' )} PdcTeamId
 */

/**
 * @type {Record<PdcTeamId, PdcTeamId>}
 */
const PDC_TEAM_IDS = {
  PDC_READ,
  PDC_RECONCILE,
};

const UNDERWRITING_SUPPORT = 'UNDERWRITING_SUPPORT';
const UNDERWRITER_MANAGERS = 'UNDERWRITER_MANAGERS';
const UNDERWRITERS = 'UNDERWRITERS';
const RISK_MANAGERS = 'RISK_MANAGERS';
const BUSINESS_SUPPORT = 'BUSINESS_SUPPORT';
const PIM = 'PIM';

/**
 * @typedef {import('../types/team-id').TeamId} TeamId
 */

/**
 * @type {Record<TeamId, TeamId>}
 */
const TEAM_IDS = {
  UNDERWRITING_SUPPORT,
  UNDERWRITER_MANAGERS,
  UNDERWRITERS,
  RISK_MANAGERS,
  BUSINESS_SUPPORT,
  PIM,
  ...PDC_TEAM_IDS,
};

module.exports = {
  TEAM_IDS,
  PDC_TEAM_IDS,
};
