import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../drivers/db-client';

export const deleteDeletionAuditLogsCollection = async () => {
  console.info('Audit logs');
  const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS);

  try {
    await collection.drop();
  } catch (error) {
    console.error('Failed to drop collection, continuing to insert mocks %o', error);
  }
};

export const setupDeletionAuditLogsCollection = async () => {
  console.info('Audit logs');
  const dbConnection = await mongoDbClient.getConnection();

  const collection = await dbConnection.createCollection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'deletion audit logs validation',
        required: ['collectionName', 'deletedDocumentId', 'auditRecord', 'expireAt'],
        properties: {
          collectionName: {
            bsonType: 'string',
            description: 'collectionName must be a string',
          },
          deletedDocumentId: {
            bsonType: 'objectId',
            description: 'deletedDocumentId must be an ObjectId',
          },
          expireAt: {
            bsonType: 'date',
            description: 'expireAt must be a BSON date',
          },
          auditRecord: {
            bsonType: 'object',
            description: 'auditRecord is required',
            properties: {
              lastUpdatedAt: {
                bsonType: 'string',
                description: 'lastUpdatedAt must be a string',
              },
              lastUpdatedByPortalUserId: {
                bsonType: ['null', 'objectId'],
                description: 'lastUpdatedByPortalUserId must be null or an objectId',
              },
              lastUpdatedByTfmUserId: {
                bsonType: ['null', 'objectId'],
                description: 'lastUpdatedByTfmUserId must be null or an objectId',
              },
              lastUpdatedByIsSystem: {
                bsonType: ['null', 'bool'],
                description: 'lastUpdatedByIsSystem must be null or boolean',
              },
              noUserLoggedIn: {
                bsonType: ['null', 'bool'],
                description: 'lastUpdatedAt must be null or boolean',
              },
            },
          },
        },
      },
    },
  });

  await collection.createIndex(
    {
      expireAt: 1,
    },
    {
      expireAfterSeconds: 0,
    },
  );
};
