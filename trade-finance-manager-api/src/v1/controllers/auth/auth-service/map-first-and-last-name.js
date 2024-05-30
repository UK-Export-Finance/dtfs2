/**
 * mapProperty
 * Map a one property from Entra or TFM data,
 * Depending on if a value is found from the provided property names.
 * Otherwise, the provided defaultCopy is returned.
 * @param {Object} entraUserIdTokenClaims: Entra claims for the user.
 * @param {String} entraPropertyName Entra property name to use.
 * @param {Object} tfmUser: Optional TFM user object.
 * @param {String} tfmPropertyName: TFM property name to use.
 * @param {String} defaultCopy: Default copy to return if no name/value is found.
 * @returns {String}
 */
const mapProperty = ({ entraUserIdTokenClaims = {}, entraPropertyName = '', tfmUser = {}, tfmPropertyName = '', defaultCopy = '' }) =>
  entraUserIdTokenClaims[entraPropertyName] || tfmUser[tfmPropertyName] || defaultCopy;

/**
 * mapFirstAndLastName
 * Map first and last name properties via mapName.
 * @param {Object} entraUserIdTokenClaims: Entra claims for the user.
 * @param {Object} tfmUser: TFM user object.
 * @returns {Object} Object with firstName and lastName
 */
const mapFirstAndLastName = (entraUserIdTokenClaims, tfmUser) => ({
  firstName: mapProperty({
    entraUserIdTokenClaims,
    tfmUser,
    entraPropertyName: 'given_name',
    tfmPropertyName: 'firstName',
    defaultCopy: 'No name',
  }),
  lastName: mapProperty({
    entraUserIdTokenClaims,
    tfmUser,
    entraPropertyName: 'family_name',
    tfmPropertyName: 'lastName',
    defaultCopy: 'No surname',
  }),
});

module.exports = {
  mapFirstAndLastName,
};
