import { AuditDetails, DURABLE_FUNCTIONS_LOG, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { deleteMany } from '@ukef/dtfs2-common/change-stream';
import db from '../drivers/db-client';

export const deleteAllDurableFunctionLogs = async (auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> => {
  return await deleteMany({
    filter: {},
    collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
    db,
    auditDetails,
  });
};

/**
 * Deletes all durable function logs that have the type "ACBS" and status "Completed"
 * @returns The result of the deletion
 */
export const deleteAllCompleteAcbsDurableFunctionLogs = async (auditDetails: AuditDetails): Promise<{ acknowledged: boolean }> => {
  return await deleteMany({
    filter: {
      $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }],
    },
    collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
    db,
    auditDetails,
  });
};
