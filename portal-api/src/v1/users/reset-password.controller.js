const db = require('../../drivers/db-client');
const sendEmail = require('../email');
const { createPasswordToken } = require('./controller');

const sendResetEmail = async (emailAddress, resetToken) => {
  const EMAIL_TEMPLATE_ID = '6935e539-1a0c-4eca-a6f3-f239402c0987';

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    {
      resetToken,
    },
  );
};

/**
 * Send a password update confirmation email with update timestamp.
 * @param {String} emailAddress User email address
 * @param {String} timestamp Password update timestamp
 */
exports.sendPasswordUpdateEmail = async (emailAddress, timestamp) => {
  const EMAIL_TEMPLATE_ID = '41235821-7e52-4d63-a773-fa147362c5f0';
  const formattedTimestamp = new Date(Number(timestamp)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    year: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short'
  });

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    {
      timestamp: formattedTimestamp,
    },
  );
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
