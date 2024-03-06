const crypto = require('node:crypto');
const { MongoDbClient } = require('@ukef/dtfs2-common/mongo-db-client');
const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');
const { UtilisationReportEntity } = require('@ukef/dtfs2-common');
const { DB_COLLECTIONS } = require('../e2e-fixtures/dbCollections');

SqlDbDataSource.initialize()
  .then(() => console.info('🗄️ Successfully initialised connection to SQL database'))
  .catch((error) => console.error('❌ Failed to initialise connection to SQL database:', error));

module.exports = {
  createTasks: ({ dbName, dbConnectionString }) => {
    const db = new MongoDbClient({ dbName, dbConnectionString });

    const usersCollectionName = 'users';
    const getUsersCollection = () => db.getCollection(usersCollectionName);

    return {
      log(message) {
        console.info('Cypress log: ', message);
        return null;
      },

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
              disabled: '',
            },
          },
        );
      },

      async disablePortalUserByUsername(username) {
        const users = await getUsersCollection();
        return users.updateOne(
          { username: { $eq: username } },
          {
            $set: {
              disabled: true,
            },
          },
        );
      },

      async insertUtilisationReportDetailsIntoDb(utilisationReportDetails) {
        const utilisationReports = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
        return utilisationReports.insertMany(utilisationReportDetails);
      },

      async removeAllUtilisationReportDetailsFromDb() {
        await SqlDbDataSource.manager.getRepository(UtilisationReportEntity).delete({});

        // TODO FN-1853 Remove mongo db operation
        const utilisationReports = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
        return utilisationReports.deleteMany({});
      },

      async getAllBanks() {
        const banks = await db.getCollection(DB_COLLECTIONS.BANKS);
        return banks.find().toArray();
      },
    };
  },
};
