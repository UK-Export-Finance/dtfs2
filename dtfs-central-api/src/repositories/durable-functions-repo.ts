import { AuditDetails, DURABLE_FUNCTIONS_LOG, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { deleteManyWithAuditLogs } from '@ukef/dtfs2-common/change-stream';
import db from '../drivers/db-client';

const getDurableFunctionsLogCollection = async () => db.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);

export const deleteAllDurableFunctionLogs = async (auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    await deleteManyWithAuditLogs({
      filter: {},
      collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
      db,
      auditDetails,
    });

    return { acknowledged: true };
  }
  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({});
};

/**
 * Deletes all durable function logs that have the type "ACBS" and status "Completed"
 * @returns The result of the deletion
 */
export const deleteAllCompleteAcbsDurableFunctionLogs = async (auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    await deleteManyWithAuditLogs({
      filter: {
        $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }],
      },
      collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
      db,
      auditDetails,
    });

    return { acknowledged: true };
  }

  const durableFunctionLogsCollection = await getDurableFunctionsLogCollection();
  return durableFunctionLogsCollection.deleteMany({
    $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }],
  });
};
