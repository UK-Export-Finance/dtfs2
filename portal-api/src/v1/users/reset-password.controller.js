const utils = require('../../crypto/utils');
const db = require('../../drivers/db-client');
const sendEmail = require('../email');

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

exports.resetPassword = async (email) => {
  const collection = await db.getCollection('users');

  const user = await collection.findOne({ email });

  if (!user) {
    return {
      success: false,
    };
  }

  const { hash } = utils.genPasswordResetToken(user);

  const userUpdate = {
    resetPwdToken: hash,
    resetPwdTimestamp: `${Date.now()}`,
  };

  // eslint-disable-next-line no-underscore-dangle
  await collection.updateOne({ _id: user._id }, { $set: userUpdate }, {});

  await sendResetEmail(user.email, hash);

  return {
    success: true,
    resetToken: hash,
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
