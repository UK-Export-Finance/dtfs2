const { mongoDbClient: db } = require('../../drivers/db-client');
const sendEmail = require('../email');
const { createPasswordToken } = require('./controller');
const { EMAIL_TEMPLATE_IDS } = require('../../constants');

/**
 * Attempts to send an email to the specified email address containing a link that allows the user to reset their password securely.
 * @param {string} emailAddress - The recipient's email address to which the password reset.
 * @param {string} resetToken - A secure string that allows the user to reset their password.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const sendResetEmail = async (emailAddress, resetToken) => {
  const { PORTAL_UI_URL: domain } = process.env;

  await sendEmail(EMAIL_TEMPLATE_IDS.PASSWORD_RESET, emailAddress, {
    domain,
    resetToken,
  });
};

exports.resetPassword = async (email, userService, auditDetails) => {
  const resetToken = await createPasswordToken(email, '', userService, auditDetails);

  if (resetToken) {
    await sendResetEmail(email, resetToken);
  }
};

exports.getUserByPasswordToken = async (resetPwdToken) => {
  if (typeof resetPwdToken !== 'string') {
    throw new Error('Invalid Reset Pwd Token');
  }

  const collection = await db.getCollection('users');
  const user = await collection.findOne({ resetPwdToken: { $eq: resetPwdToken } });

  if (!user) {
    return false;
  }

  return user;
};
