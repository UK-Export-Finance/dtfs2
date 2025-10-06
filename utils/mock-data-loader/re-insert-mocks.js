const { isChangeStreamEnabled, isTfmSsoFeatureFlagEnabled } = require('@ukef/dtfs2-common');
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

const isTfmSsoEnabled = isTfmSsoFeatureFlagEnabled();
const isAuditLogEnabled = isChangeStreamEnabled();

const init = async () => {
  let e2e = false;
  console.info('\n\r⚡ Mock data loader\n\r');

  if (process.argv.includes('--e2e')) {
    e2e = true;
  }

  try {
    // Portal
    console.info('\n\r➕ Portal\n\r');

    const portalToken = await createAndLogInAsInitialUser();

    // Clean tables
    console.info('\n\r🧹 Clean-up\n\r');
    await cleanAllTablesPortal(portalToken);
    await cleanAllTablesGef(portalToken);

    if (isAuditLogEnabled) {
      await deleteDeletionAuditLogsCollection();
    }

    // Insert mocks
    console.info('\n\r💾 Insertion\n\r');
    await insertMocks(portalToken, e2e, process.argv);
    await insertMocksGef(portalToken, e2e);

    if (isAuditLogEnabled) {
      await setupDeletionAuditLogsCollection();
    }

    // Residual accounts removal
    console.info('\n\r🗑️ Housekeeping\n\r');
    await deleteInitialUser(portalToken);

    // TFM
    if (!isTfmSsoEnabled) {
      console.info('\n\r➕ TFM\n\r');
      const tfmToken = await createAndLogInAsInitialTfmUser();

      // Clean tables
      console.info('\n\r🧹 Clean-up\n\r');
      await cleanAllTablesTfm();

      // Insert mocks
      console.info('\n\r💾 Insertion\n\r');
      await insertMocksTfm(tfmToken);

      // Residual accounts removal
      console.info('\n\r🗑️ Housekeeping\n\r');
      await deleteInitialTFMUser(tfmToken);
    } else {
      console.info('\n\r⚠️ Skipping TFM, SSO is enabled.\n\r');
    }
  } catch (error) {
    console.error('❌ An error has occurred while insert mock data');

    try {
      if (process.env.CHANGE_STREAM_ENABLED === 'true') {
        await deleteDeletionAuditLogsCollection();
      }

      const portalToken = await createAndLogInAsInitialUser();
      await cleanAllTablesPortal(portalToken);
      await cleanAllTablesGef(portalToken);
      await cleanAllTablesTfm();
    } catch (cleanError) {
      console.error('❌ An error has occurred while trying to clean tables %o', cleanError);
    }

    await db.close();
    throw error;
  }

  await db.close();
  console.info('\n\r✅ Insertion successful\n\r');
};

init();
