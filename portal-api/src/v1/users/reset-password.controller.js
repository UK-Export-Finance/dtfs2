const db = require('../../drivers/db-client');
const api = require('../api');
const { createPasswordToken } = require('./controller');

const sendResetEmail = async (emailAddress, resetToken) => {
  const EMAIL_TEMPLATE_ID = '6935e539-1a0c-4eca-a6f3-f239402c0987';

  await api.sendEmail(EMAIL_TEMPLATE_ID, emailAddress, {
    resetToken,
  });
};

exports.resetPassword = async (email) => {
  const resetToken = await createPasswordToken(email);

  if (!resetToken) {
    return {
      success: false,
    };
  }

  await sendResetEmail(email, resetToken);

  return {
    success: true,
    resetToken,
  };
};

exports.getUserByPasswordToken = async (resetPwdToken) => {
  const collection = await db.getCollection('users');
  const user = await collection.findOne({ resetPwdToken });

  if (!user) {
    return false;
  }

  return user;
};
