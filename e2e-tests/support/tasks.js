const crypto = require('node:crypto');
const db = require('./db-client');
const redis = require('./redis-client');

const createTfmDealToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-deal-to-insert-into-db');
const createTfmFacilityToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-facility-to-insert-into-db');
const { DB_COLLECTIONS } = require('../e2e-fixtures/dbCollections');

module.exports = {
  /**
   * createTasks
   * Create tasks that can be executed when running E2E tests.
   * @param {String} dbName: Database name
   * @param {String} dbConnectionString: Database connection string
   * @param {String} redisHost: Redis host address
   * @param {String} redisPort: Redis port number
   * @param {String} redisKey: Redis key
   * @returns {Object} Various tasks
   */
  createTasks: ({
    dbName,
    dbConnectionString,
    redisHost,
    redisPort,
    redisKey,
  }) => {
    const connectionOptions = { dbName, dbConnectionString };
    const redisConnectionOptions = { redisHost, redisPort, redisKey };

    const usersCollectionName = 'users';
    const tfmUsersCollectionName = 'tfm-users';
    const tfmDealsCollectionName = 'tfm-deals';
    const tfmFacilitiesCollectionName = 'tfm-facilities';

    const getUsersCollection = () => db.getCollection(usersCollectionName, connectionOptions);
    const getTfmUsersCollection = () => db.getCollection(tfmUsersCollectionName, connectionOptions);
    const getTfmDealsCollection = () => db.getCollection(tfmDealsCollectionName, connectionOptions);
    const getTfmFacilitiesCollection = () => db.getCollection(tfmFacilitiesCollectionName, connectionOptions);

    const log = (message) => {
      console.info('Cypress log %s', message);
      return null;
    };

    /**
     * getUserFromDbByEmail
     * Get a user from the DB by email
     * @param {String} email
     * @returns {Object} User
     */
    const getUserFromDbByEmail = async (email) => {
      const users = await getUsersCollection();
      return users.findOne({ email: { $eq: email } });
    };

    /**
     * getUserFromDbByUsername
     * Get a user from the DB by username
     * @param {String} username
     * @returns {Object} User
     */
    const getUserFromDbByUsername = async (username) => {
      const users = await getUsersCollection();
      return users.findOne({ username: { $eq: username } });
    };

    /**
     * getTfmUserFromDbByUsername
     * Get a TFM user from the DB by username
     * @param {String} username
     * @returns {Object} User
     */
    const getTfmUserFromDbByUsername = async (username) => {
      const tfmUsers = await getTfmUsersCollection();

      const user = tfmUsers.findOne({ username: { $eq: username } });

      return user;
    };

    /**
     * overridePortalUserSignInTokenWithValidTokenByUsername
     * Override a portal user's sign in token with a valid token, by username.
     * @param {String} username
     * @param {String} newSignInToken
     * @returns {Object} Updated user
     */
    const overridePortalUserSignInTokenWithValidTokenByUsername = async ({ username, newSignInToken }) => {
      const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
      const salt = crypto.randomBytes(64);
      const hash = crypto.pbkdf2Sync(newSignInToken, salt, 210000, 64, 'sha512');
      const saltHex = salt.toString('hex');
      const hashHex = hash.toString('hex');
      const expiry = Date.now() + thirtyMinutesInMilliseconds;
      const userCollection = await getUsersCollection();
      return userCollection.updateOne({ username: { $eq: username } }, { $set: { signInTokens: [{ hashHex, saltHex, expiry }] } });
    };

    /**
     * overridePortalUserSignInTokensByUsername
     * Override a portal user's sign in token with multiple sign in tokens.
     * @param {String} username
     * @param {Array} newSignInTokens
     * @returns {Object} Updated user
     */
    const overridePortalUserSignInTokensByUsername = async ({ username, newSignInTokens }) => {
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
    };

    /**
     * overrideTfmUserSessionId
     * Override a TFM user's session ID/identifier
     * @param {String} username
     * @param {String} sessionIdentifier
     * @returns {Object} Updated user
     */
    const overrideTfmUserSessionId = async ({ username, sessionIdentifier }) => {
      const tfmUsers = await getTfmUsersCollection();
      return tfmUsers.updateOne({ username: { $eq: username } }, { $set: { sessionIdentifier } });
    };

    /**
     * overrideRedisUserSession
     * Override a redis user session.
     * @param {String} sessionIdentifier: Redis session identifier
     * @param {Object} tfmUser: New session identifier value
     * @param {String} userToken: TFM token string value
     * @param {Number} maxAge: Session age
     * @returns {Boolean}
     */
    const overrideRedisUserSession = async ({
      sessionIdentifier,
      tfmUser,
      userToken,
      maxAge,
    }) => {
      const maxAgeInMilliseconds = maxAge * 1000;

      const value = {
        cookie: {
          originalMaxAge: maxAgeInMilliseconds,
          expires: new Date(new Date().getTime() + (maxAgeInMilliseconds)).toISOString(),
          secure: false,
          httpOnly: true,
          path: '/',
          sameSite: 'strict',
        },
        user: tfmUser,
        userToken: `Bearer ${userToken}`,
      };
      await redis.set({
        key: `sess:${sessionIdentifier}`,
        value,
        maxAge,
        config: redisConnectionOptions,
      });

      return true;
    };

    /**
     * resetPortalUserStatusAndNumberOfSignInLinks
     * Reset a portal user's status and sign ins by username.
     * @param {String} username
     * @returns {Object} Updated user
     */
    const resetPortalUserStatusAndNumberOfSignInLinks = async (username) => {
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
    };

    /**
     * disablePortalUserByUsername
     * Disable a portal user by username.
     * @param {String} username
     * @returns {Object} Updated user
     */
    const disablePortalUserByUsername = async (username) => {
      const users = await getUsersCollection();
      return users.updateOne(
        { username: { $eq: username } },
        {
          $set: {
            disabled: true,
          },
        },
      );
    };

    /**
     * insertUtilisationReportDetailsIntoDb
     * Add multiple utilisation report details to the DB.
     * @param {Array} utilisationReportDetails: Utilisation report details
     * @returns {Array} Created Utilisation report details
     */
    const insertUtilisationReportDetailsIntoDb = async (utilisationReportDetails) => {
      const utilisationReports = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS, connectionOptions);
      return utilisationReports.insertMany(utilisationReportDetails);
    };

    /**
     * removeAllUtilisationReportDetailsFromDb
     * Remove all utilisation report details from the DB.
     * @returns {Array} Empty array.
     */
    const removeAllUtilisationReportDetailsFromDb = async () => {
      const utilisationReports = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS, connectionOptions);
      return utilisationReports.deleteMany({});
    };

    const getAllBanks = async () => {
      const banks = await db.getCollection(DB_COLLECTIONS.BANKS, connectionOptions);
      return banks.find().toArray();
    };

    /**
     * Generates the specified number of TFM deals and inserts them directly
     * into the db. The UKEF deal ID of the first generated deal is 10000001;
     * this is incremented for each subsequent deal. The deal exporter is
     * 'Company 1' for the deals with odd numbered UKEF deal IDs and 'Company 2'
     * for those with even numbered UKEF deal IDs. This is to allow easy testing
     * of searching and sorting. Optionally, an array of MongoDB deal Object IDs
     * to use can be passed as the second argument - if the number of deals to
     * insert exceeds the length of this array (by n, say), then the last n deals
     * will have their MongoDB Object IDs autogenerated
     * @param {Object} numberOfDealsToInsert The number of deals to insert
     * @param {Array} dealObjectIds An array of MongoDB deal Object IDs to use
     * @returns {Object} MongoDB document representing the result of the insertion
    */
    const insertManyTfmDeals = async (numberOfDealsToInsert, dealObjectIds = []) => {
      const deals = await getTfmDealsCollection();
      const dealsToInsert = [];
      for (let i = 0; i < numberOfDealsToInsert; i += 1) {
        const ukefDealId = (10000001 + i).toString();
        const companyName = i % 2 === 0 ? 'Company 1' : 'Company 2';
        const dealObjectId = dealObjectIds[i];
        dealsToInsert.push(createTfmDealToInsertIntoDb(ukefDealId, companyName, dealObjectId));
      }
      return deals.insertMany(dealsToInsert);
    };

    const deleteAllTfmDeals = async () => {
      const deals = await getTfmDealsCollection();
      return deals.deleteMany({});
    };

    /**
     * Generates the specified number of TFM facilities and inserts them directly
     * into the db. It also inserts two deals (to link the facilities to).
     * The UKEF facility ID of the first generated facility is 10000001;
     * this is incremented for each subsequent facility. The inserted facilities
     * alternate with respect to which of the two deals they are linked to. This
     * is to allow easy testing of searching and sorting
     * @param {Object} numberOfFacilitiesToInsert The number of facilities to insert
     * @returns {Object} MongoDB document representing the result of the insertion
    */
    const insertManyTfmFacilitiesAndTwoLinkedDeals = async (numberOfFacilitiesToInsert) => {
      const dealObjectIds = ['65f18fd9cb063105fd4be63f', '65f18fd9cb063105fd4be645'];

      insertManyTfmDeals(2, dealObjectIds);

      const facilities = await getTfmFacilitiesCollection();
      const facilitiesToInsert = [];
      for (let i = 0; i < numberOfFacilitiesToInsert; i += 1) {
        const ukefFacilityId = (10000001 + i).toString();
        const dealObjectId = dealObjectIds[i % 2];
        facilitiesToInsert.push(createTfmFacilityToInsertIntoDb(ukefFacilityId, dealObjectId));
      }
      return facilities.insertMany(facilitiesToInsert);
    };

    const deleteAllTfmFacilities = async () => {
      const facilities = await getTfmFacilitiesCollection();
      return facilities.deleteMany({});
    };

    return {
      log,
      getUserFromDbByEmail,
      getUserFromDbByUsername,
      getTfmUserFromDbByUsername,
      overridePortalUserSignInTokenWithValidTokenByUsername,
      overridePortalUserSignInTokensByUsername,
      overrideTfmUserSessionId,
      overrideRedisUserSession,
      resetPortalUserStatusAndNumberOfSignInLinks,
      disablePortalUserByUsername,
      insertUtilisationReportDetailsIntoDb,
      insertManyTfmDeals,
      deleteAllTfmDeals,
      insertManyTfmFacilitiesAndTwoLinkedDeals,
      deleteAllTfmFacilities,
      removeAllUtilisationReportDetailsFromDb,
      getAllBanks,
    };
  },
};
