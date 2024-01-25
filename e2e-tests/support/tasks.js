const crypto = require('node:crypto');
const db = require('./db-client');

module.exports = {
  createTasks: ({ dbName, dbConnectionString }) => {
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

      async overridePortalUserSignInTokenByUsername({ username, newSignInToken }) {
        const salt = crypto.randomBytes(64);
        const hash = crypto.pbkdf2Sync(newSignInToken, salt, 210000, 64, 'sha512');
        const saltHex = salt.toString('hex');
        const hashHex = hash.toString('hex');
        const users = await getUsersCollection();
        return users.updateOne({ username: { $eq: username } }, { $set: { signInToken: { hashHex, saltHex } } });
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
            },
          },
        );
      },

      async insertUtilisationReportDetailsIntoDb(utilisationReportDetails) {
        const utilisationReports = await db.getCollection('utilisationReports', connectionOptions);
        return utilisationReports.insertMany(utilisationReportDetails);
      },

      async removeAllUtilisationReportDetailsFromDb() {
        const utilisationReports = await db.getCollection('utilisationReports', connectionOptions);
        return utilisationReports.deleteMany({});
      },

      async getAllBanks() {
        const banks = await db.getCollection('banks', connectionOptions);
        return banks.find().toArray();
      },
    };
  },
};
