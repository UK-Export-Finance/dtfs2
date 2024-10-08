const { mongoDbClient: db } = require('../../drivers/db-client');
const sendEmail = require('../email');
const { createPasswordToken } = require('./controller');
const { EMAIL_TEMPLATE_IDS } = require('../../constants');

const sendResetEmail = async (emailAddress, resetToken) => {
  await sendEmail(EMAIL_TEMPLATE_IDS.PASSWORD_RESET, emailAddress, {
    resetToken,
  });
};

exports.resetPassword = async (email, userService, auditDetails) => {
  const resetToken = await createPasswordToken(email, userService, auditDetails);

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
