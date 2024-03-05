const existingTfmUser = require('./get-and-map-existing-tfm-user');
const tfmUser = require('./create-tfm-user');

/**
 * getOrCreate
 * Get or create a TFM user.
 * - If a user is found from the provided Entra user and has canProceed=true, simply return the user.
 * - If a user is found, but has canProceed=false, throw an error.
 * - If a user is not found, create a new TFM user from the provided Entra user data.
 * @param {Object} entraUser: Entra user data
 * @returns {Object} New or existing TFM user
 */
const getOrCreate = async (entraUser) => {
  try {
    console.info('TFM auth service - Getting or creating a TFM user');

    const { user, mapped } = await existingTfmUser.getAndMap(entraUser);
    
    if (user.found) {
      console.info('TFM auth service - found an existing user');

      if (user.canProceed) {
        console.info('TFM auth service - updating user');

        // TODO: add updating of user teams, first name and last name.
        // Maybe merge with last login and session update.

        return mapped;
      } else {
        console.info("TFM auth service - user cannot proceed");
        throw new Error("TFM auth service - user cannot proceed");
      }
    } else {
      console.info('TFM auth service - no existing TFM user found. Creating a new TFM user');

      const mappedTfmUser = await tfmUser.create(entraUser);

      return mappedTfmUser;
    }
  } catch (error) {
    console.error('TFM auth service - Getting or creating a TFM user %s', error);

    throw new Error('TFM auth service - Getting or creating a TFM user %s', error);
  }
};

module.exports = { getOrCreate };
