/* eslint-disable no-param-reassign */
const { produce } = require('immer');

const transformDatabaseUser = (user) => {
  if (!user.signInTokens) {
    return user;
  }

  return produce(user, (draft) => {
    draft.signInTokens = user.signInTokens.map((signInToken) => {
      const { hashHex, saltHex, expiry } = signInToken;
      return {
        hash: Buffer.from(hashHex, 'hex'),
        salt: Buffer.from(saltHex, 'hex'),
        expiry,
      };
    });
  });
};

const transformDatabaseUsers = (users) => users.map(transformDatabaseUser);

module.exports = {
  transformDatabaseUser,
  transformDatabaseUsers,
};
