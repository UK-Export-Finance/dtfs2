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
 * @typedef {import('../types/teamIds').TeamId} TeamId
 * @typedef {import('../types/team').Team} Team
 */

/**
 * @type {Record<TeamId, Team>}
 */
module.exports = {
  UNDERWRITING_SUPPORT,
  UNDERWRITER_MANAGERS,
  UNDERWRITERS,
  RISK_MANAGERS,
  BUSINESS_SUPPORT,
  PIM,
  PDC_READ,
  PDC_RECONCILE,
};
