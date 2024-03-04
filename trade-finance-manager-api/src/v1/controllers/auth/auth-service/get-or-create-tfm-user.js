const existingTfmUser = require('./get-and-map-existing-tfm-user');
const tfmUser = require('./create-tfm-user');

/**
 * getOrCreateTfmUser
 * Get or create a TFM user.
 * - If a user is found from the provided Entra user, simply return the 
 * @param {*} entraUser 
 * @returns {Object} New or existing TFM user
 */
const getOrCreateTfmUser = async (entraUser) => {
  try {
    console.info('TFM auth service - Getting or creating a TFM user');

    const { user, mapped } = await existingTfmUser.getAndMap(entraUser);
    
    if (user.found) {
      console.info('TFM auth service - found an existing user');

      if (user.canProceed) {
        console.info('TFM auth service - updating user');
        // TODO: add updating of user teams, first name and last name.
        // Maybe merge with last login and session update.
      } else {
        console.info("TFM auth service - user cannot proceed");
        throw new Error("TFM auth service - user cannot proceed");
      }
    } else {
      console.info('TFM auth service - no existing TFM user found. Creating a new TFM user');

      const mappedTfmUser = await tfmUser.create(entraUser);

      return mappedTfmUser;
    }

    return mapped;
  } catch (error) {
    console.error('TFM auth service - Getting or creating a TFM user %s', error);

    throw new Error('TFM auth service - Getting or creating a TFM user %s', error);
  }
};

module.exports = getOrCreateTfmUser;
