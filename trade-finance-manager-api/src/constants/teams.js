const UNDERWRITING_SUPPORT = {
  id: 'UNDERWRITING_SUPPORT',
  name: 'Underwriting support',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_UNDERWRITING_SUPPORT',
};

const UNDERWRITER_MANAGERS = {
  id: 'UNDERWRITER_MANAGERS',
  name: 'Underwriter managers',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_UNDERWRITER_MANAGERS',
};

const UNDERWRITERS = {
  id: 'UNDERWRITERS',
  name: 'Underwriters',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_UNDERWRITERS',
};

const RISK_MANAGERS = {
  id: 'RISK_MANAGERS',
  name: 'Risk managers',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_RISK_MANAGERS',
};

const BUSINESS_SUPPORT = {
  id: 'BUSINESS_SUPPORT',
  name: 'Business support group',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_BUSINESS_SUPPORT',
};

const PIM = {
  id: 'PIM',
  name: 'Post issue management',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_PIM',
};

// TODO: remove READ_ONLY?
const READ_ONLY = {
  id: 'READ_ONLY',
  name: 'Read only',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_READ_ONLY',
};

const PDC_READ = {
  id: 'PDC_READ',
  name: 'PDC read',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_PDC_READ',
};

const PDC_RECONCILE = {
  id: 'PDC_RECONCILE',
  name: 'PDC reconcile',
  ssoGroupEnvVar: 'AZURE_SSO_GROUP_PDC_RECONCILE',
};

/**
 * @typedef {import('../types/team-id').TeamId} TeamId
 * @typedef {import('../types/team').Team} Team
 */

/**
 * @type {Record<TeamId, Team>}
 */
const TEAMS = {
  UNDERWRITING_SUPPORT,
  UNDERWRITER_MANAGERS,
  UNDERWRITERS,
  RISK_MANAGERS,
  BUSINESS_SUPPORT,
  PIM,
  READ_ONLY,
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
