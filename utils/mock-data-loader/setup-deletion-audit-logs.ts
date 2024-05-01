import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { getCollection, getConnection } from './database/database-client';
import { logger } from './helpers/logger.helper';

export const deleteDeletionAuditLogsCollection = async () => {
  logger.info('Dropping deletion audit logs collection');
  const collection = await getCollection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS);

  try {
    await collection.drop();
  } catch {
    // This will throw an error if the collection doesn't exist
  }
};

export const setupDeletionAuditLogsCollection = async () => {
  logger.info('Setting up deletion audit logs collection');
  const dbConnection = await getConnection();

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
                bsonType: 'date',
                description: 'lastUpdatedAt must be a BSON date',
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
  const collection = await getCollection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS);

  await collection.createIndex(
    {
      'auditRecord.lastUpdatedAt': 1,
      // 'createdAt': 1,
    },
    {
      expireAfterSeconds: 60, // 1 minute. This should be increased on Dev/Prod
    },
  );

  await collection.insertOne({
    collectionName: 'users',
    deletedDocumentId: new ObjectId('6630cd95933028a128c5c081'),
    auditRecord: {
      lastUpdatedAt: new Date(),
      lastUpdatedByPortalUserId: null,
      lastUpdatedByTfmUserId: null,
      lastUpdatedByIsSystem: null,
      noUserLoggedIn: true,
    },
  });
  // try {
  //   await collection.insertOne({
  //     "collectionName": "users",
  //     "deletedDocumentId": new ObjectId("6630cd95933028a128c5c081"),
  //     "auditRecord": {
  //       "lastUpdatedAt": new Date(),
  //       "lastUpdatedByPortalUserId": "null",
  //       "lastUpdatedByTfmUserId": null,
  //       "lastUpdatedByIsSystem": null,
  //       "noUserLoggedIn": true
  //     },
  //   });
  // } catch (error) {
  //   console.error(error);
  // }
};
