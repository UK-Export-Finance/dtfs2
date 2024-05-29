import { Collection, ObjectId, WithoutId } from 'mongodb';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';
import { changeStreamConfig } from '../config';

type Params = {
  makeRequest: () => Promise<void>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentId: () => ObjectId;
};

export const withDeleteOneTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentId }: Params) => {
  describe(`when deleting a document from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;

    beforeAll(async () => {
      mongoDbClient = new MongoDbClient({
        dbName: process.env.MONGO_INITDB_DATABASE as string,
        dbConnectionString: process.env.MONGODB_URI as string,
      });

      deletionAuditLogsCollection = await mongoDbClient.getCollection('deletion-audit-logs');
    });

    if (changeStreamConfig.CHANGE_STREAM_ENABLED === 'true') {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      afterAll(async () => {
        await mongoDbClient.close();
      });

      describe('when the service is working normally', () => {
        it('should add a deletion audit log', async () => {
          await makeRequest();

          const deletionAuditLogs = await deletionAuditLogsCollection
            .find({ collectionName: { $eq: collectionName }, deletedDocumentId: { $eq: getDeletedDocumentId() } })
            .toArray();

          expect(deletionAuditLogs).toEqual([
            {
              _id: expect.any(ObjectId) as ObjectId,
              collectionName,
              deletedDocumentId: new ObjectId(getDeletedDocumentId()),
              auditRecord,
              expireAt: expect.any(Date) as Date,
            },
          ]);
        });

        it('should delete the document', async () => {
          await makeRequest();

          const collection = await mongoDbClient.getCollection(collectionName);
          const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

          expect(deletedDocument).toBe(null);
        });
      });

      describe('when deleting the document is not acknowledged', () => {
        beforeEach(() => {
          jest.spyOn(Collection.prototype, 'deleteOne').mockImplementationOnce(() => ({
            acknowledged: false,
          }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when no document is deleted', () => {
        beforeEach(() => {
          jest.spyOn(Collection.prototype, 'deleteOne').mockImplementationOnce(() => ({
            acknowledged: true,
            deletedCount: 0,
          }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when deleting the document throws an error', () => {
        beforeEach(() => {
          jest.spyOn(Collection.prototype, 'deleteOne').mockImplementationOnce(() => {
            throw new Error();
          });
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        beforeEach(() => {
          jest.spyOn(Collection.prototype, 'insertOne').mockImplementationOnce(() => ({
            acknowledged: false,
          }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log throws an error', () => {
        beforeEach(() => {
          jest.spyOn(Collection.prototype, 'insertOne').mockImplementationOnce(() => {
            throw new Error();
          });
        });

        itDoesNotUpdateTheDatabase();
      });
    } else {
      it('should delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(deletedDocument).toBe(null);
      });
    }

    function itDoesNotUpdateTheDatabase() {
      it('should not add a deletion audit log', async () => {
        await makeRequest();

        const deletionAuditLogs = await deletionAuditLogsCollection
          .find({ collectionName: { $eq: collectionName }, deletedDocumentId: { $eq: getDeletedDocumentId() } })
          .toArray();
        expect(deletionAuditLogs).toEqual([]);
      });

      it('should not delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const document = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(document).toBeTruthy();
      });
    }
  });
};
