import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient } from './database/database-client';
import { logger } from './helpers/logger.helper';

export const deleteDeletionAuditLogsCollection = async () => {
  logger.info('Dropping deletion audit logs collection');
  const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS);

  try {
    await collection.drop();
  } catch (error) {
    logger.info('Failed to drop collection, continuing to insert mocks', { depth: 1 });
    logger.error(String(error), { depth: 1 });
  }
};

export const setupDeletionAuditLogsCollection = async () => {
  logger.info('Setting up deletion audit logs collection');
  const dbConnection = await mongoDbClient.getConnection();

  await dbConnection.createCollection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'deletion audit logs validation',
        required: ['collectionName', 'deletedDocumentId', 'auditRecord'],
        properties: {
          collectionName: {
            bsonType: 'string',
            description: 'collectionName must be a string',
          },
          deletedDocumentId: {
            bsonType: 'objectId',
            description: 'deletedDocumentId must be an ObjectId',
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
};
