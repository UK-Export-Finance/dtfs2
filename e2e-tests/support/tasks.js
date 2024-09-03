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
const createTfmDealToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-deal-to-insert-into-db');
const createTfmFacilityToInsertIntoDb = require('../tfm/cypress/fixtures/create-tfm-facility-to-insert-into-db');
const { DB_COLLECTIONS } = require('../e2e-fixtures/dbCollections');
const { ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES } = require('../e2e-fixtures');
const { generateVersion0GefDealDatabaseDocument, generateVersion0GefFacilityDatabaseDocument } = require('../e2e-fixtures/deal-versioning.fixture');

SqlDbDataSource.initialize()
  .then(() => console.info('✅ Successfully initialised connection to SQL database'))
  .catch((error) => console.error('❌ Failed to initialise connection to SQL database:', error));

module.exports = {
  createTasks: ({ dbName, dbConnectionString }) => {
    const db = new MongoDbClient({ dbName, dbConnectionString });

    const usersCollectionName = 'users';
    const tfmDealsCollectionName = 'tfm-deals';
    const tfmFacilitiesCollectionName = 'tfm-facilities';

    const getUsersCollection = () => db.getCollection(usersCollectionName);
    const getTfmDealsCollection = () => db.getCollection(tfmDealsCollectionName);
    const getTfmFacilitiesCollection = () => db.getCollection(tfmFacilitiesCollectionName);

    const log = (message) => {
      console.info('Cypress log %s', message);
      return null;
    };

    const getUserFromDbByEmail = async (email) => {
      const users = await getUsersCollection();
      return users.findOne({ email: { $eq: email } });
    };

    const getUserFromDbByUsername = async (username) => {
      const users = await getUsersCollection();
      return users.findOne({ username: { $eq: username } });
    };

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
      for (const { facilityUtilisationData } of feeRecords) {
        const entityExists = await SqlDbDataSource.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityUtilisationData.id });
        if (!entityExists) {
          await SqlDbDataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);
        }
      }
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
     * Inserts one or more facility utilisation data entities into the SQL database
     * @param {FacilityUtilisationDataEntity | FacilityUtilisationDataEntity[]} facilityUtilisationData - The facility utilisation data
     * @returns The inserted entity
     */
    const insertFacilityUtilisationDataIntoDb = async (facilityUtilisationData) =>
      await SqlDbDataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);

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
      overridePortalUserSignInTokenWithValidTokenByUsername,
      overridePortalUserSignInTokensByUsername,
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
      insertFacilityUtilisationDataIntoDb,
      deleteAllFromSqlDb,
    };
  },
};
