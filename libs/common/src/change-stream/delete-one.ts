import { ObjectId, DeleteResult } from 'mongodb';
import { AuditDetails, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { deleteDocumentWithAuditLogs } from './delete-document-with-audit-logs';

type DeleteOneParams = {
  documentId: ObjectId;
  collectionName: MongoDbCollectionName;
  db: MongoDbClient;
  auditDetails: AuditDetails;
};

export const deleteOne = async ({ documentId, collectionName, db, auditDetails }: DeleteOneParams): Promise<DeleteResult> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    await deleteDocumentWithAuditLogs({
      documentId,
      collectionName,
      db,
      auditDetails,
    });

    return { acknowledged: true, deletedCount: 1 };
  }

  const collection = await db.getCollection(collectionName);
  return await collection.deleteOne({ _id: { $eq: documentId } });
};
