const tfmUser = require('./get-existing-tfm-user');
const populateTfmUserWithEntraData = require('./populate-tfm-user-with-entra-data');

/**
 * getAndMapExistingTfmUser
 * Get and map an existing TFM user from Entra user data.
 * @param {Object} entraUser: Entra user data
 * @returns {Object} TFM user with mapped data
 */
const getAndMap = async (entraUser) => {
  try {
    if (entraUser) {
      console.info('TFM auth service - getting and mapping existing TFM user');

      const user = await tfmUser.get(entraUser);

      const mapped = populateTfmUserWithEntraData(user, entraUser);

      return {
        user,
        mapped
      };
    }

    return {};
  } catch {
    console.error("TFM auth service - Error getting and mapping existing TFM user");

    throw new Error("TFM auth service - Error getting and mapping existing TFM user");
  }
};

module.exports = { getAndMap };
