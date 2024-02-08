const crypto = require('node:crypto');
const db = require('./db-client');
const createTfmDealToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-deal-to-insert-into-db');

module.exports = {
  createUserTasks: ({ dbName, dbConnectionString }) => {
    const connectionOptions = { dbName, dbConnectionString };
    const usersCollectionName = 'users';
    const tfmDealsCollectionName = 'tfm-deals';

    const getUsersCollection = () => db.getCollection(usersCollectionName, connectionOptions);
    const getTfmDealsCollection = () => db.getCollection(tfmDealsCollectionName, connectionOptions);

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

      async insertManyTfmDeals(numberOfDealsToInsert) {
        const deals = await getTfmDealsCollection();
        const dealsToInsert = [];
        for (let i = 0; i < numberOfDealsToInsert; i += 1) {
          dealsToInsert.push(createTfmDealToInsertIntoDb());
        }
        return deals.insertMany(dealsToInsert);
      },

      async deleteAllTfmDeals() {
        const deals = await getTfmDealsCollection();
        return deals.deleteMany({});
      },
    };
  },
};
