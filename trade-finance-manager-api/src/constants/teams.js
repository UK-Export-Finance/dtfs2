const UNDERWRITING_SUPPORT = {
  id: 'UNDERWRITING_SUPPORT',
  name: 'Underwriting support',
};

const UNDERWRITER_MANAGERS = {
  id: 'UNDERWRITER_MANAGERS',
  name: 'Underwriter managers',
};

const UNDERWRITERS = {
  id: 'UNDERWRITERS',
  name: 'Underwriters',
};

const RISK_MANAGERS = {
  id: 'RISK_MANAGERS',
  name: 'Risk managers',
};

const BUSINESS_SUPPORT = {
  id: 'BUSINESS_SUPPORT',
  name: 'Business support group',
};

const PIM = {
  id: 'PIM',
  name: 'Post issue management',
};

const PDC_READ = {
  id: 'PDC_READ',
  name: 'PDC read',
};

const PDC_RECONCILE = {
  id: 'PDC_RECONCILE',
  name: 'PDC reconcile',
};

/**
 * @typedef {import('@ukef/dtfs2-common').TeamId} TeamId
 * @typedef {import('@ukef/dtfs2-common').TfmTeam} TfmTeam
 */

/**
 * @type {Record<TeamId, TfmTeam>}
 */
const TEAMS = {
  UNDERWRITING_SUPPORT,
  UNDERWRITER_MANAGERS,
  UNDERWRITERS,
  RISK_MANAGERS,
  BUSINESS_SUPPORT,
  PIM,
  PDC_READ,
  PDC_RECONCILE,
};

/**
 * @type {TeamId[]}
 */
const TEAM_IDS = Object.values(TEAMS).map(({ id }) => id);

module.exports = {
  TEAMS,
  TEAM_IDS,
};
