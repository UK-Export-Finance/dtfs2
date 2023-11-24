const transformDatabaseUser = (user) => {
  const userToReturn = { ...user };
  if (userToReturn.signInToken) {
    const { hashHex, saltHex, expiry } = userToReturn.signInToken;
    userToReturn.signInToken = {
      hash: Buffer.from(hashHex, 'hex'),
      salt: Buffer.from(saltHex, 'hex'),
      expiry,
    };
  }
  return userToReturn;
};

const transformDatabaseUsers = (users) => users.map(transformDatabaseUser);

module.exports = {
  transformDatabaseUser,
  transformDatabaseUsers,
};
