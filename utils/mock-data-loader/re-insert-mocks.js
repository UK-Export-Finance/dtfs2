const { createAndLogInAsInitialTfmUser, createAndLogInAsInitialUser, deleteInitialUser, deleteInitialTFMUser } = require('./user-helper');
const { mongoDbClient: db } = require('../drivers/db-client');

const cleanAllTablesPortal = require('./clean-all-tables-portal');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const { setupDeletionAuditLogsCollection, deleteDeletionAuditLogsCollection } = require('./setup-deletion-audit-logs');

const init = async () => {
  console.info('⚡ Inserting mock data');
  try {
    const portalToken = await createAndLogInAsInitialUser();

    if (process.env.CHANGE_STREAM_ENABLED === 'true') {
      await deleteDeletionAuditLogsCollection();
      await setupDeletionAuditLogsCollection();
    }
    await cleanAllTablesPortal(portalToken);
    await cleanAllTablesGef(portalToken);
    await cleanAllTablesTfm();

    await insertMocks(portalToken);
    await insertMocksGef(portalToken);

    const tfmToken = await createAndLogInAsInitialTfmUser();
    await insertMocksTfm(tfmToken);

    await deleteInitialTFMUser(tfmToken);
    await deleteInitialUser(portalToken);
  } catch (error) {
    console.error('❌ An error occurred, attempting to clean all tables');
    try {
      if (process.env.CHANGE_STREAM_ENABLED === 'true') {
        await deleteDeletionAuditLogsCollection();
      }
      const portalToken = await createAndLogInAsInitialUser();
      await cleanAllTablesPortal(portalToken);
      await cleanAllTablesGef(portalToken);
      await cleanAllTablesTfm();
    } catch {
      console.error('❌ Not all tables could be cleared. Consider manually clearing your database before retrying');
    }
    console.error('❌ The following error occurred while attempting to reinsert mocks:');
    throw error;
  }
  await db.close();

  console.info('✅ Insertion successfull');
};

init();
