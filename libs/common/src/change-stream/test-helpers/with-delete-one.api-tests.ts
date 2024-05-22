import { Collection, ObjectId, WithoutId } from 'mongodb';
import { when, WhenMock } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';

const collectionMethodsToNotMock = ['findOne', 'insertOne', 'updateOne'] as const;

type Params = {
  makeRequest: () => Promise<void>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentId: () => ObjectId;
  mockGetCollection: jest.Mock;
};

export const withDeleteOneTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentId, mockGetCollection }: Params) => {
  describe(`when deleting a document from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;

    if (process.env.CHANGE_STREAM_ENABLED) {
      beforeAll(async () => {
        mongoDbClient = new MongoDbClient({
          dbName: process.env.MONGO_INITDB_DATABASE as string,
          dbConnectionString: process.env.MONGODB_URI as string,
        });

        deletionAuditLogsCollection = await mongoDbClient.getCollection('deletion-audit-logs');
      });

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
        const originalMockCollection = mockGetCollection(collectionName) as Promise<Collection>;
        let whenMock: WhenMock;
        beforeAll(async () => {
          const collection = await originalMockCollection;
          const mockCollection: Record<string, unknown> = {};

          collectionMethodsToNotMock.forEach((methodName) => {
            mockCollection[methodName] = collection[methodName].bind(collection);
          });

          mockCollection.deleteOne = jest.fn(() => ({
            acknowledged: false,
          }));

          whenMock = when(mockGetCollection).calledWith(collectionName).mockResolvedValue(mockCollection);
        });

        afterAll(() => {
          whenMock.resetWhenMocks();
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when no document is deleted', () => {
        const originalMockCollection = mockGetCollection(collectionName) as Promise<Collection>;
        let whenMock: WhenMock;
        beforeAll(async () => {
          const collection = await originalMockCollection;
          const mockCollection: Record<string, unknown> = {};

          collectionMethodsToNotMock.forEach((methodName) => {
            mockCollection[methodName] = collection[methodName].bind(collection);
          });

          mockCollection.deleteOne = jest.fn(() => ({
            acknowledged: true,
            deletedCount: 0,
          }));

          whenMock = when(mockGetCollection).calledWith(collectionName).mockResolvedValue(mockCollection);
        });

        afterAll(() => {
          whenMock.resetWhenMocks();
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when deleting the document throws an error', () => {
        const originalMockCollection = mockGetCollection(collectionName) as Promise<Collection>;
        let whenMock: WhenMock;
        beforeAll(async () => {
          const collection = await originalMockCollection;
          const mockCollection: Record<string, unknown> = {};

          collectionMethodsToNotMock.forEach((methodName) => {
            mockCollection[methodName] = collection[methodName].bind(collection);
          });

          mockCollection.deleteOne = jest.fn(() => {
            throw new Error();
          });

          whenMock = when(mockGetCollection).calledWith(collectionName).mockResolvedValue(mockCollection);
        });

        afterAll(() => {
          whenMock.resetWhenMocks();
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        let whenMock: WhenMock;

        beforeAll(() => {
          const mockCollection = {
            insertOne: jest.fn(() => ({
              acknowledged: false,
            })),
          };

          whenMock = when(mockGetCollection).calledWith('deletion-audit-logs').mockResolvedValue(mockCollection);
        });

        afterAll(() => {
          whenMock.resetWhenMocks();
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log throws an error', () => {
        let whenMock: WhenMock;

        beforeAll(() => {
          const mockCollection = {
            insertOne: jest.fn(() => {
              throw new Error();
            }),
          };

          whenMock = when(mockGetCollection).calledWith('deletion-audit-logs').mockResolvedValue(mockCollection);
        });

        afterAll(() => {
          whenMock.resetWhenMocks();
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
