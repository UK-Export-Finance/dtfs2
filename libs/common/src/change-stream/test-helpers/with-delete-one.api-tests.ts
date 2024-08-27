import { ClientSession, Collection, ObjectId, WithoutId } from 'mongodb';
import { when } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';
import { changeStreamConfig } from '../config';

const { CHANGE_STREAM_ENABLED } = changeStreamConfig;

type Params = {
  makeRequest: () => Promise<{ status: number }>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentId: () => ObjectId;
  expectedStatusWhenNoDeletion?: number;
};

export const withDeleteOneTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentId, expectedStatusWhenNoDeletion = 404 }: Params) => {
  describe(`when deleting a document from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;
    const mockDeleteOne = jest.spyOn(Collection.prototype, 'deleteOne');
    const mockInsertOne = jest.spyOn(Collection.prototype, 'insertOne');

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
      mockDeleteOne.mockRestore();
      mockInsertOne.mockRestore();
    });

    if (CHANGE_STREAM_ENABLED) {
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
            },
          ]);
        });

        it('should delete the document', async () => {
          await makeRequest();

          const collection = await mongoDbClient.getCollection(collectionName);
          const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

          expect(deletedDocument).toBe(null);
        });

        it('should return 200', async () => {
          const { status } = await makeRequest();

          expect(status).toBe(200);
        });
      });

      describe('when deleting the document is not acknowledged', () => {
        beforeEach(() => {
          when(mockDeleteOne)
            .calledWith({ _id: { $eq: getDeletedDocumentId() } }, { session: expect.any(ClientSession) as ClientSession })
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();

        it('should return 500', async () => {
          const { status } = await makeRequest();

          expect(status).toBe(500);
        });
      });

      describe('when no document is deleted', () => {
        beforeEach(() => {
          when(mockDeleteOne)
            .calledWith({ _id: { $eq: getDeletedDocumentId() } }, { session: expect.any(ClientSession) as ClientSession })
            .mockImplementationOnce(() => ({
              acknowledged: true,
              deletedCount: 0,
            }));
        });

        itDoesNotUpdateTheDatabase();

        it(`should return ${expectedStatusWhenNoDeletion}`, async () => {
          const { status } = await makeRequest();

          expect(status).toBe(expectedStatusWhenNoDeletion);
        });
      });

      describe('when deleting the document throws an error', () => {
        beforeEach(() => {
          when(mockDeleteOne)
            .calledWith({ _id: { $eq: getDeletedDocumentId() } }, { session: expect.any(ClientSession) as ClientSession })
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();

        it('should return 500', async () => {
          const { status } = await makeRequest();

          expect(status).toBe(500);
        });
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        beforeEach(() => {
          when(mockInsertOne)
            // @ts-ignore
            .calledWith(
              {
                collectionName,
                deletedDocumentId: getDeletedDocumentId(),
                auditRecord,
              },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();

        it('should return 500', async () => {
          const { status } = await makeRequest();

          expect(status).toBe(500);
        });
      });

      describe('when inserting the deletion log throws an error', () => {
        beforeEach(() => {
          when(mockInsertOne)
            // @ts-ignore
            .calledWith(
              {
                collectionName,
                deletedDocumentId: getDeletedDocumentId(),
                auditRecord,
              },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();

        it('should return 500', async () => {
          const { status } = await makeRequest();

          expect(status).toBe(500);
        });
      });
    } else {
      it('should delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(deletedDocument).toBe(null);
      });

      it('should return 200', async () => {
        const { status } = await makeRequest();

        expect(status).toBe(200);
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
