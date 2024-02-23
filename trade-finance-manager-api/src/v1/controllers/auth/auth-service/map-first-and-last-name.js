/**
 * mapName
 * Map a name from Entra or TFM data,
 * Depending on if a value is found from the provided property names.
 * Otherwise, the provided defaultCopy is returned.
 * @param {Object} entraUser: Entra user object.
 * @param {String} entraPropertyName Entra property name to use.
 * @param {Object} tfmUser: Optional TFM user object.
 * @param {String} tfmPropertyName: TFM property name to use.
 * @param {String} defaultCopy: Default copy to return if no name/value is found.
 * @returns {String}
 */
const mapName = ({
  entraUser = {},
  entraPropertyName = '',
  tfmUser = {},
  tfmPropertyName = '',
  defaultCopy = '',
}) =>
  entraUser[entraPropertyName] || tfmUser[tfmPropertyName]  || defaultCopy;

/**
 * mapFirstAndLastName
 * Map first and last name properties via mapName.
 * @param {Object} entraUser: Entra user object.
 * @param {Object} tfmUser: TFM user object.
 * @returns {Object} Object with firstName and lastName
 */
const mapFirstAndLastName = (entraUser, tfmUser) => ({
  firstName: mapName({
    entraUser,
    tfmUser,
    entraPropertyName: 'given_name',
    tfmPropertyName: 'firstName',
    defaultCopy: 'No name',
  }),
  lastName: mapName({
    entraUser,
    tfmUser,
    entraPropertyName: 'family_name',
    tfmPropertyName: 'lastName',
    defaultCopy: 'No surname',
  }),
});

module.exports = {
  mapName,
  mapFirstAndLastName,
};
