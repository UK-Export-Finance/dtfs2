const crypto = require('node:crypto');
const db = require('./db-client');

module.exports = {
  createUserTasks: ({ dbName, dbConnectionString }) => {
    const connectionOptions = { dbName, dbConnectionString };
    const usersCollectionName = 'users';

    const getUsersCollection = () => db.getCollection(usersCollectionName, connectionOptions);

    return {
      async getUserFromDbByEmail(email) {
        const users = await getUsersCollection();
        return users.findOne({ email: { $eq: email } });
      },

      async getUserFromDbByUsername(username) {
        const users = await getUsersCollection();
        return users.findOne({ username: { $eq: username } });
      },

      async overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken }) {
        const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
        const salt = crypto.randomBytes(64);
        const hash = crypto.pbkdf2Sync(newSignInToken, salt, 210000, 64, 'sha512');
        const saltHex = salt.toString('hex');
        const hashHex = hash.toString('hex');
        const expiry = Date.now() + thirtyMinutesInMilliseconds;
        const userCollection = await getUsersCollection();
        return userCollection.updateOne({ username: { $eq: username } }, { $set: { signInTokens: [{ hashHex, saltHex, expiry }] } });
      },

      async overridePortalUserSignInTokensByUsername({ username, newSignInTokens }) {
        const signInTokens = newSignInTokens.map((newSignInToken) => {
          const { signInTokenFromLink, expiry } = newSignInToken;
          const salt = crypto.randomBytes(64);
          const hash = crypto.pbkdf2Sync(signInTokenFromLink, salt, 210000, 64, 'sha512');
          const saltHex = salt.toString('hex');
          const hashHex = hash.toString('hex');
          return { saltHex, hashHex, expiry };
        });

        const userCollection = await getUsersCollection();
        return userCollection.updateOne({ username: { $eq: username } }, { $set: { signInTokens } });
      },

      async resetPortalUserStatusAndNumberOfSignInLinks(username) {
        const users = await getUsersCollection();
        return users.updateOne(
          { username: { $eq: username } },
          {
            $set: {
              'user-status': 'active',
            },
            $unset: {
              signInLinkSendDate: '',
              signInLinkSendCount: '',
              blockedStatusReason: '',
              signInLikeTokens: '',
            },
          },
        );
      },
    };
  },
};
