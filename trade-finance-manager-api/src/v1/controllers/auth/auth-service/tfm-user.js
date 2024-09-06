const { generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');

const mapEntraUserData = require('./map-entra-user-data');
const userController = require('../../user/user.controller');

/**
 * create
 * Create a TFM user from Entra user data.
 * @param {object} entraUser Entra user data
 * @returns {Promise<object>} New TFM user.
 */
const create = async (entraUser) => {
  try {
    console.info('TFM auth service - mapping Entra user and creating TFM user');

    const userData = mapEntraUserData(entraUser);
    const auditDetails = generateNoUserLoggedInAuditDetails();
    return await userController.createUser(userData, auditDetails);
  } catch {
    console.error('TFM auth service - Error mapping Entra user and creating TFM user');

    throw new Error('TFM auth service - Error mapping Entra user and creating TFM user');
  }
};

/**
 * update
 * Update a TFM user from Entra user data.
 * @param {object} entraUser Entra user data
 * @returns {Promise<object>} updated TFM user.
 */
const update = async (userId, entraUser) => {
  try {
    console.info('TFM auth service - mapping Entra user and updating TFM user');

    const entraUserData = mapEntraUserData(entraUser);

    const updatedUser = await userController.updateUser(userId, entraUserData);

    return updatedUser;
  } catch {
    console.error('TFM auth service - Error mapping Entra user and updating TFM user');

    throw new Error('TFM auth service - Error mapping Entra user and updating TFM user');
  }
};

module.exports = { create, update };
