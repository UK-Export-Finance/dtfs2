const crypto = require('node:crypto');
const db = require('./db-client');
const redis = require('./redis-client');

const COLLECTION_NAMES = {
  USERS: 'users',
  TFM_USERS: 'tfm-users',
  UTILISATION_REPORTS: 'utilisationReports',
};

const getUsersCollection = (connectionOptions) => db.getCollection(COLLECTION_NAMES.USERS, connectionOptions);
const getTfmUsersCollection = (connectionOptions) => db.getCollection(COLLECTION_NAMES.TFM_USERS, connectionOptions);
const getUtilisationReportsCollection = (connectionOptions) => db.getCollection(COLLECTION_NAMES.UTILISATION_REPORTS, connectionOptions);

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
const createTasks = ({
  dbName,
  dbConnectionString,
  redisHost,
  redisPort,
  redisKey,
}) => {
  const connectionOptions = { dbName, dbConnectionString };
  const redisConnectionOptions = { redisHost, redisPort, redisKey };

  return {
    log(message) {
      console.info('Cypress log: ', message);
      return null;
    },

    /**
     * getUserFromDbByEmail
     * Get a user from the DB by email
     * @param {String} email
     * @returns {Object} User
     */
    async getUserFromDbByEmail(email) {
      const users = await getUsersCollection(connectionOptions);
      return users.findOne({ email: { $eq: email } });
    },

    /**
     * getUserFromDbByUsername
     * Get a user from the DB by username
     * @param {String} username
     * @returns {Object} User
     */
    async getUserFromDbByUsername(username) {
      const users = await getUsersCollection(connectionOptions);
      return users.findOne({ username: { $eq: username } });
    },

    /**
     * getTfmUserFromDbByUsername
     * Get a TFM user from the DB by username
     * @param {String} username
     * @returns {Object} User
     */
    async getTfmUserFromDbByUsername(username) {
      const tfmUsers = await getTfmUsersCollection(connectionOptions);
      return tfmUsers.findOne({ username: { $eq: username } });
    },

    /**
     * overridePortalUserSignInTokenWithValidTokenByUsername
     * Override a portal user's sign in token with a valid token, by username.
     * @param {String} username
     * @param {String} newSignInToken
     * @returns {Object} Updated user
     */
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

    /**
     * overridePortalUserSignInTokensByUsername
     * Override a portal user's sign in token with multiple sign in tokens.
     * @param {String} username
     * @param {Array} newSignInTokens
     * @returns {Object} Updated user
     */
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

    /**
     * overrideTfmUserSessionId
     * Override a TFM user's session ID/identifier
     * @param {String} username
     * @param {String} sessionIdentifier
     * @returns {Object} Updated user
     */
    async overrideTfmUserSessionId({ username, sessionIdentifier }) {
      const tfmUsers = await getTfmUsersCollection(connectionOptions);
      return tfmUsers.updateOne({ username: { $eq: username } }, { $set: { sessionIdentifier } });
    },

    /**
     * overrideRedisUserSession
     * Override a redis user session.
     * @param {String} sessionIdentifier: Redis session identifier
     * @param {String} value: New session identifier value
     * @param {String} maxAge: Session age
     * @returns {Boolean}
     */
    async overrideRedisUserSession({ sessionIdentifier, value, maxAge }) {
      await redis.set({
        key: `sess:${sessionIdentifier}`,
        value,
        maxAge,
        config: redisConnectionOptions,
      });

      return true;
    },

    /**
     * resetPortalUserStatusAndNumberOfSignInLinks
     * Reset a portal user's status and sign ins by username.
     * @param {String} username
     * @returns {Object} Updated user
     */
    async resetPortalUserStatusAndNumberOfSignInLinks(username) {
      const users = await getUsersCollection(connectionOptions);

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

    /**
     * disablePortalUserByUsername
     * Disable a portal user by username.
     * @param {String} username
     * @returns {Object} Updated user
     */
    async disablePortalUserByUsername(username) {
      const users = await getUsersCollection(connectionOptions);

      return users.updateOne(
        { username: { $eq: username } },
        {
          $set: {
            disabled: true,
          },
        },
      );
    },

    /**
     * insertUtilisationReportDetailsIntoDb
     * Add multiple utilisation report details to the DB.
     * @param {Array} utilisationReportDetails: Utilisation report details
     * @returns {Array} Created Utilisation report details
     */
    async insertUtilisationReportDetailsIntoDb(utilisationReportDetails) {
      const utilisationReports = await getUtilisationReportsCollection(connectionOptions);
      return utilisationReports.insertMany(utilisationReportDetails);
    },

    /**
     * removeAllUtilisationReportDetailsFromDb
     * Remove all utilisation report details from the DB.
     * @returns {Array} Empty array.
     */
    async removeAllUtilisationReportDetailsFromDb() {
      const utilisationReports = await getUtilisationReportsCollection(connectionOptions);
      return utilisationReports.deleteMany({});
    },
  };
};

module.exports = { createTasks };
