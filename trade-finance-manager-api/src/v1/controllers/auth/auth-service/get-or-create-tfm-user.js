const existingTfmUser = require('./get-and-map-existing-tfm-user');
const tfmUser = require('./tfm-user');

/**
 * getOrCreate
 * Get or create a TFM user.
 * - If a user is found from the provided Entra user and has canProceed=true, update the TFM user and return.
 * - If a user is found, but has canProceed=false, throw an error.
 * - If a user is not found, create a new TFM user from the provided Entra user data.
 * @param {Object} entraUser: Entra user data
 * @returns {Object} New or existing TFM user
 */
const getOrCreate = async (entraUser) => {
  try {
    console.info('TFM auth service - Getting or creating a TFM user');

    const user = await existingTfmUser.getAndMap(entraUser);

    if (user?.found) {
      console.info('TFM auth service - found an existing user');

      if (user.canProceed) {
        console.info('TFM auth service - updating user');

        await tfmUser.update(user._id, entraUser);

        return user;
      }

      console.info("TFM auth service - user cannot proceed");
      throw new Error("TFM auth service - user cannot proceed");
    } else {
      console.info('TFM auth service - no existing TFM user found. Creating a new TFM user');

      const createdUser = await tfmUser.create(entraUser);

      return createdUser;
    }
  } catch (error) {
    console.error('TFM auth service - Getting or creating a TFM user %s', error);

    throw new Error('TFM auth service - Getting or creating a TFM user %s', error);
  }
};

module.exports = { getOrCreate };
