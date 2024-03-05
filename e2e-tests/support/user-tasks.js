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

      /**
       * Generates the specified number of TFM deals and inserts them directly
       * into the db. The UKEF deal ID of the first generated deal is 10000001;
       * this is incremented for each subsequent deal. The deal exporter is
       * 'Company 1' for the deals with odd numbered UKEF deal IDs and 'Company 2'
       * for those with even numbered UKEF deal IDs. This is to allow easy testing
       * of searching and sorting
       * @param {Object} numberOfDealsToInsert The number of deals to insert
       * @returns {Object} MongoDB document representing the result of the insertion
      */
      async insertManyTfmDeals(numberOfDealsToInsert) {
        const deals = await getTfmDealsCollection();
        const dealsToInsert = [];
        for (let i = 0; i < numberOfDealsToInsert; i += 1) {
          const ukefDealId = (10000001 + i).toString();
          const companyName = i % 2 === 0 ? 'Company 1' : 'Company 2';
          dealsToInsert.push(createTfmDealToInsertIntoDb(ukefDealId, companyName));
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
