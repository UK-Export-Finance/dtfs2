const { TEAM_IDS } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../constants');
const { userIsInTeam } = require('../../../helpers/user');

const bondParties = [CONSTANTS.PARTY.BOND.BOND_ISSUER, CONSTANTS.PARTY.BOND.BOND_BENEFICIARY];

const userCanEdit = (user) => userIsInTeam(user, [TEAM_IDS.BUSINESS_SUPPORT]);

/**
 * Returns bond type from party type
 * @param {string} party party type either as `bond-issuer` or `bond-beneficiary`.
 * @returns {string} bond type
 */
const bondType = (party) => (party === CONSTANTS.PARTY.BOND.BOND_ISSUER ? 'bondIssuerPartyUrn' : 'bondBeneficiaryPartyUrn');

// checks if bond type and returns true or false
const isBondPartyType = (partyType) => bondParties.includes(partyType);

/**
 * Constructs `errRef` based on `partyType`
 * if `bondBeneficiary` or `bondIssuer`, then add index for field reference
 * otherwise should return default field reference.
 * @param {string} partyType Party type
 * @param {Integer} index Party URN field index
 * @returns {string} Party URN reference for an inline error display
 */
const constructErrRef = (party, index) => (isBondPartyType(party) ? `partyUrn-${index}` : 'partyUrn');

// checks if string is empty - checks that string is '' and does not have a length and returns true if so
const isEmptyString = (str) => !!(!str || ((typeof str === 'string' || str instanceof String) && !str.trim().length));

/**
 * Extracts party name from the URL
 * @param {string} url Request URL
 * @returns {string} Party name
 */
const partyType = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return false;
  }

  const routes = url.toLowerCase().split('/');

  if (!routes || !routes.length) {
    return false;
  }

  const { PARTIES } = CONSTANTS.PARTY;

  return PARTIES.filter((party) => routes.includes(party)).toString();
};

module.exports = {
  userCanEdit,
  bondType,
  isBondPartyType,
  constructErrRef,
  isEmptyString,
  partyType,
};
