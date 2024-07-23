import { cleanAllTables } from './clean-all-tables';
import { createAndLogInAsInitialUser, deleteInitialUser } from './user-helper';
import { mongoDbClient } from './database/database-client';
import { insertMocks } from './insert-mocks';
import { insertGefMocks } from './insert-gef-mocks';
import { insertTfmMocks } from './insert-tfm-mocks';
import { logger, LOGGER_COLOURS } from './helpers/logger.helper';

import { setupDeletionAuditLogsCollection, deleteDeletionAuditLogsCollection } from './setup-deletion-audit-logs';

const init = async () => {
  logger.info('REINSERTING MOCKS', { colour: LOGGER_COLOURS.bright });
  try {
    await cleanAllTables();

    if (process.env.CHANGE_STREAM_ENABLED === 'true') {
      await deleteDeletionAuditLogsCollection();
      await setupDeletionAuditLogsCollection();
    }

    const portalToken = await createAndLogInAsInitialUser();
    await insertMocks(portalToken);
    await insertGefMocks(portalToken);

    await insertTfmMocks();

    await deleteInitialUser();
  } catch (error) {
    logger.error('An error occurred, attempting to clean all tables');
    try {
      if (process.env.CHANGE_STREAM_ENABLED === 'true') {
        await deleteDeletionAuditLogsCollection();
      }
      await cleanAllTables();
    } catch {
      logger.error('Not all tables could be cleared. Consider manually clearing your database before retrying');
    }
    logger.error('The following error occurred while attempting to reinsert mocks:');
    throw error;
  } finally {
    await mongoDbClient.close();
  }

  logger.info('REINSERTING MOCKS SUCCESSFUL', { colour: LOGGER_COLOURS.bright });
};

(async () => init())();
