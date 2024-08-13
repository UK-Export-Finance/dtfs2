const crypto = require('node:crypto');
const { MongoDbClient } = require('@ukef/dtfs2-common/mongo-db-client');
const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');
const {
  UtilisationReportEntity,
  FeeRecordEntity,
  PaymentEntity,
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  PaymentMatchingToleranceEntity,
} = require('@ukef/dtfs2-common');
const RedisClient = require('./redis-client');
const createTfmDealToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-deal-to-insert-into-db');
const createTfmFacilityToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-facility-to-insert-into-db');
const { DB_COLLECTIONS } = require('../e2e-fixtures/dbCollections');
const { ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES } = require('../e2e-fixtures');
const { generateVersion0GefDealDatabaseDocument, generateVersion0GefFacilityDatabaseDocument } = require('../e2e-fixtures/deal-versioning.fixture');

SqlDbDataSource.initialize()
  .then(() => console.info('✅ Successfully initialised connection to SQL database'))
  .catch((error) => console.error('❌ Failed to initialise connection to SQL database:', error));

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
  createTasks: ({ dbName, dbConnectionString, redisHost, redisPort, redisKey }) => {
    const redisConnectionOptions = { redisHost, redisPort, redisKey };
    const db = new MongoDbClient({ dbName, dbConnectionString });

    const usersCollectionName = 'users';
    const tfmUsersCollectionName = 'tfm-users';
    const tfmDealsCollectionName = 'tfm-deals';
    const tfmFacilitiesCollectionName = 'tfm-facilities';

    const getUsersCollection = () => db.getCollection(usersCollectionName);
    const getTfmUsersCollection = () => db.getCollection(tfmUsersCollectionName);
    const getTfmDealsCollection = () => db.getCollection(tfmDealsCollectionName);
    const getTfmFacilitiesCollection = () => db.getCollection(tfmFacilitiesCollectionName);

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
    const overrideRedisUserSession = async ({ sessionIdentifier, tfmUser, userToken, maxAge }) => {
      const maxAgeInMilliseconds = maxAge * 1000;

      const value = {
        cookie: {
          originalMaxAge: maxAgeInMilliseconds,
          expires: new Date(new Date().getTime() + maxAgeInMilliseconds).toISOString(),
          secure: false,
          httpOnly: true,
          path: '/',
          sameSite: 'strict',
        },
        user: tfmUser,
        userToken: `Bearer ${userToken}`,
      };
      await RedisClient.set({
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
     * Inserts utilisation report details to the SQL database
     * @param {Partial<UtilisationReportEntity[]>} utilisationReports
     * @returns {Promise<UtilisationReportEntity[]>} The inserted reports
     */
    const insertUtilisationReportsIntoDb = async (utilisationReports) => {
      const utilisationReportRepo = SqlDbDataSource.getRepository(UtilisationReportEntity);
      const saveOperations = utilisationReports.map((utilisationReport) => utilisationReportRepo.save(utilisationReport));
      return await Promise.all(saveOperations);
    };

    /**
     * Deletes all the rows from the utilisation report table
     */
    const removeAllUtilisationReportsFromDb = async () => await SqlDbDataSource.manager.getRepository(UtilisationReportEntity).delete({});

    /**
     * Inserts fee records to the SQL database
     * @param {FeeRecordEntity[]} feeRecords
     * @returns {Promise<FeeRecordEntity[]>} The inserted fee records
     */
    const insertFeeRecordsIntoDb = async (feeRecords) => {
      await Promise.all(
        feeRecords.map(async ({ facilityUtilisationData }) => {
          const entityExists = await SqlDbDataSource.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityUtilisationData.id });
          if (!entityExists) {
            await SqlDbDataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);
          }
        }),
      );
      return await SqlDbDataSource.manager.save(FeeRecordEntity, feeRecords);
    };

    /**
     * Deletes all the rows from the payment matching tolerance table
     */
    const removeAllPaymentMatchingTolerancesFromDb = async () => await SqlDbDataSource.manager.getRepository(PaymentMatchingToleranceEntity).delete({});

    /**
     * Deletes and inserts payment matching tolerances for each currency to the SQL database
     */
    const reinsertZeroThresholdPaymentMatchingTolerances = async () => {
      await SqlDbDataSource.manager.delete(PaymentMatchingToleranceEntity, {});
      return await SqlDbDataSource.manager.save(PaymentMatchingToleranceEntity, ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
    };

    /**
     * Inserts payment matching tolerances to the SQL database
     * @param {PaymentMatchingToleranceEntity[]} tolerances
     * @returns {Promise<PaymentMatchingToleranceEntity[]>} The inserted tolerance
     */
    const insertPaymentMatchingTolerancesIntoDb = async (tolerances) => await SqlDbDataSource.manager.save(PaymentMatchingToleranceEntity, tolerances);

    /**
     * Inserts payments to the SQL database
     * @param {PaymentEntity[]} payments
     * @returns The inserted payments
     */
    const insertPaymentsIntoDb = async (payments) => await SqlDbDataSource.manager.save(PaymentEntity, payments);

    /**
     * Deletes all the rows from the payment table
     */
    const removeAllPaymentsFromDb = async () => await SqlDbDataSource.manager.delete(PaymentEntity, {});

    /**
     * Deletes all the rows from the payment table
     */
    const removeAllFeeRecordsFromDb = async () => await SqlDbDataSource.manager.delete(FeeRecordEntity, {});

    /**
     * Deletes all data from the SQL database
     */
    const deleteAllFromSqlDb = async () =>
      await Promise.all([
        await SqlDbDataSource.manager.delete(PaymentEntity, {}),
        await SqlDbDataSource.manager.delete(FeeRecordEntity, {}),
        await SqlDbDataSource.manager.delete(UtilisationReportEntity, {}),
        await SqlDbDataSource.manager.delete(AzureFileInfoEntity, {}),
        await SqlDbDataSource.manager.delete(FacilityUtilisationDataEntity, {}),
        await SqlDbDataSource.manager.delete(PaymentMatchingToleranceEntity, {}),
      ]);

    const getAllBanks = async () => {
      const banks = await db.getCollection(DB_COLLECTIONS.BANKS);
      return banks.find().toArray();
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
     * Generates the specified number of TFM deals and inserts them directly
     * into the db. The UKEF deal ID of the first generated deal is 10000001;
     * this is incremented for each subsequent deal. The deal exporter is
     * 'Company 1' for the deals with odd numbered UKEF deal IDs and 'Company 2'
     * for those with even numbered UKEF deal IDs. This is to allow easy testing
     * of searching and sorting. Optionally, an array of MongoDB deal Object IDs
     * to use can be passed as the second argument - if the number of deals to
     * insert exceeds the length of this array (by n, say), then the last n deals
     * will have their MongoDB Object IDs autogenerated
     * @param {object} numberOfDealsToInsert The number of deals to insert
     * @param {Array} dealObjectIds An array of MongoDB deal Object IDs to use
     * @returns {Promise<object>} MongoDB document representing the result of the insertion
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
     * Inserts many tfm facilities
     * @param {import('@ukef/dtfs2-common').TfmFacility[]} tfmFacilities
     * @returns {Promise<import('mongodb').InsertManyResult<import('mongodb').WithoutId<import('@ukef/dtfs2-common').TfmFacility>>[]>} The inserted tfm facilities
     */
    const insertManyTfmFacilities = async (tfmFacilities) => {
      const tfmFacilitiesCollection = await getTfmFacilitiesCollection();
      return await tfmFacilitiesCollection.insertMany(tfmFacilities);
    };

    /**
     * Generates the specified number of TFM facilities and inserts them directly
     * into the db. It also inserts two deals (to link the facilities to).
     * The UKEF facility ID of the first generated facility is 10000001;
     * this is incremented for each subsequent facility. The inserted facilities
     * alternate with respect to which of the two deals they are linked to. This
     * is to allow easy testing of searching and sorting
     * @param {object} numberOfFacilitiesToInsert The number of facilities to insert
     * @returns {Promise<object>} MongoDB document representing the result of the insertion
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

    const insertVersion0Deal = async (makerUserName) => {
      const dealsCollection = await db.getCollection(DB_COLLECTIONS.DEALS);
      const usersCollection = await getUsersCollection();

      const maker = await usersCollection.findOne({ username: makerUserName });

      return dealsCollection.insertOne(generateVersion0GefDealDatabaseDocument(maker));
    };

    const insertVersion0Facility = async (dealId) => {
      const facilitiesCollection = await db.getCollection(DB_COLLECTIONS.FACILITIES);

      return facilitiesCollection.insertOne(generateVersion0GefFacilityDatabaseDocument(dealId));
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
      insertManyTfmDeals,
      deleteAllTfmDeals,
      insertManyTfmFacilities,
      insertManyTfmFacilitiesAndTwoLinkedDeals,
      deleteAllTfmFacilities,
      getAllBanks,
      insertUtilisationReportsIntoDb,
      removeAllUtilisationReportsFromDb,
      insertVersion0Deal,
      insertVersion0Facility,
      insertFeeRecordsIntoDb,
      removeAllPaymentMatchingTolerancesFromDb,
      reinsertZeroThresholdPaymentMatchingTolerances,
      insertPaymentMatchingTolerancesIntoDb,
      insertPaymentsIntoDb,
      removeAllPaymentsFromDb,
      removeAllFeeRecordsFromDb,
      deleteAllFromSqlDb,
    };
  },
};
