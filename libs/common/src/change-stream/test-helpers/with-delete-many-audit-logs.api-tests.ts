import { Collection, ObjectId, WithoutId } from 'mongodb';
import { when, WhenMock } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';

const collectionMethodsToNotMock = ['findOne', 'insertOne', 'insertMany'] as const;

type Params = {
  makeRequest: () => Promise<void>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentIds: () => ObjectId[];
  mockGetCollection: jest.Mock;
};

export const withDeleteManyAuditLogsTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentIds, mockGetCollection }: Params) => {
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
          .find({
            $or: getDeletedDocumentIds().map((deletedDocumentId) => ({
              collectionName: { $eq: collectionName },
              deletedDocumentId: { $eq: deletedDocumentId },
            })),
          })
          .toArray();

        expect(deletionAuditLogs).toEqual(
          getDeletedDocumentIds().map((id) => ({
            _id: expect.any(ObjectId) as ObjectId,
            collectionName,
            deletedDocumentId: new ObjectId(id),
            auditRecord,
            expireAt: expect.any(Date) as Date,
          })),
        );
      });

      it('should delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocuments = await collection
          .find({
            $or: getDeletedDocumentIds().map((deletedDocumentId) => ({
              _id: { $eq: deletedDocumentId },
            })),
          })
          .toArray();

        expect(deletedDocuments.length).toBe(0);
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

    function itDoesNotUpdateTheDatabase() {
      it('should not add a deletion audit log', async () => {
        await makeRequest();

        const deletionAuditLogs = await deletionAuditLogsCollection
          .find({
            $or: getDeletedDocumentIds().map((deletedDocumentId) => ({
              collectionName: { $eq: collectionName },
              deletedDocumentId: { $eq: deletedDocumentId },
            })),
          })
          .toArray();
        expect(deletionAuditLogs).toEqual([]);
      });

      it('should not delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocuments = await collection
          .find({
            $or: getDeletedDocumentIds().map((deletedDocumentId) => ({
              _id: { $eq: deletedDocumentId },
            })),
          })
          .toArray();

        expect(deletedDocuments.length).toBe(getDeletedDocumentIds().length);
      });
    }
  });
};
