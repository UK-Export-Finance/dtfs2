import { DeleteResult } from 'mongodb';
import { AuditDetails, DURABLE_FUNCTIONS_LOG, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { deleteMany } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient as db } from '../drivers/db-client';

export const deleteAllDurableFunctionLogs = (auditDetails: AuditDetails): Promise<DeleteResult> => {
  return deleteMany({
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
export const deleteAllCompleteAcbsDurableFunctionLogs = (auditDetails: AuditDetails): Promise<DeleteResult> => {
  return deleteMany({
    filter: {
      $and: [{ type: { $eq: DURABLE_FUNCTIONS_LOG.TYPE.ACBS } }, { status: { $eq: DURABLE_FUNCTIONS_LOG.STATUS.COMPLETED } }],
    },
    collectionName: MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG,
    db,
    auditDetails,
  });
};
