const { produce } = require('immer');

const transformDatabaseUser = (user) => {
  let userToReturn = { ...user };

  if (userToReturn.signInTokens) {
    userToReturn = produce(userToReturn, (draft) => {
      draft.signInTokens = userToReturn.signInTokens.map((signInToken) => {
        const { hashHex, saltHex, expiry } = signInToken;
        return {
          hash: Buffer.from(hashHex, 'hex'),
          salt: Buffer.from(saltHex, 'hex'),
          expiry,
        };
      });
    });
  }

  return userToReturn;
};

const transformDatabaseUsers = (users) => users.map(transformDatabaseUser);

module.exports = {
  transformDatabaseUser,
  transformDatabaseUsers,
};
