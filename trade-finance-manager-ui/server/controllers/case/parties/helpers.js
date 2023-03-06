const CONSTANTS = require('../../../constants');
const { userIsInTeam } = require('../../../helpers/user');

const userCanEdit = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.BUSINESS_SUPPORT]);

/**
 * Returns bond type from party type
 * @param {String} party party type either as `bond-issuer` or `bond-beneficiary`.
 * @returns {String} bond type
 */
const bondType = (party) => (party === 'bond-issuer' ? 'bondIssuerPartyUrn' : 'bondBeneficiaryPartyUrn');

// checks if bond type and returns true or false
const isBondPartyType = (partyType) => (partyType === 'bondBeneficiaryPartyUrn' || partyType === 'bondIssuerPartyUrn');

/**
 * constructs errRef based on partyType
 * if bondBeneficiary or bondIssuer, then needs index to specify which urn box it is referring to,
 * else should just be partyUrn
 */
const constructErrRef = (partyType, index) => {
  let errRef = 'partyUrn';

  if (isBondPartyType(partyType)) {
    errRef = `partyUrn-${index}`;
  }

  return errRef;
};

// checks if string is empty - checks that string is '' and does not have a length and returns true if so
const isEmptyString = (str) => {
  if (!str || ((typeof str === 'string' || str instanceof String) && !str.trim().length)) {
    return true;
  }
  return false;
};

/**
 * Extracts party name from the URL
 * @param {String} url Request URL
 * @returns {String} Party name
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

  return PARTIES
    .filter((party) => routes.includes(party))
    .toString();
};

module.exports = {
  userCanEdit,
  bondType,
  isBondPartyType,
  constructErrRef,
  isEmptyString,
  partyType,
};
