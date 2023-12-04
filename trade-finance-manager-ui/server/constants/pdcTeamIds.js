const PDC_READ = 'PDC_READ';
const PDC_RECONCILE = 'PDC_RECONCILE';

/**
 * @typedef {( 'PDC_READ' | 'PDC_RECONCILE' )} PdcTeamId
 */

/**
 * @type {Record<PdcTeamId, PdcTeamId>}
 */
module.exports = {
  PDC_READ,
  PDC_RECONCILE,
};
