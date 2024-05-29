import { ClientSession, Collection, ObjectId, WithoutId } from 'mongodb';
import { when } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';
import { changeStreamConfig } from '../config';

const { CHANGE_STREAM_ENABLED } = changeStreamConfig;

type Params = {
  makeRequest: () => Promise<void>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentIds: () => ObjectId[];
};

export const withDeleteManyTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentIds }: Params) => {
  describe(`when deleting a document from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;
    const deleteManyMock = jest.spyOn(Collection.prototype, 'deleteMany');
    const insertManyMock = jest.spyOn(Collection.prototype, 'insertMany');

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
      deleteManyMock.mockRestore();
      insertManyMock.mockRestore();
    });

    if (CHANGE_STREAM_ENABLED) {
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
        beforeEach(() => {
          when(deleteManyMock)
            // @ts-ignore
            .calledWith(
              { $or: expect.arrayContaining(getDeletedDocumentIds().map((_id) => ({ _id }))) as object[] },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when no document is deleted', () => {
        beforeEach(() => {
          when(deleteManyMock)
            // @ts-ignore
            .calledWith(
              { $or: expect.arrayContaining(getDeletedDocumentIds().map((_id) => ({ _id }))) as object[] },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => ({
              acknowledged: true,
              deletedCount: 0,
            }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when deleting the document throws an error', () => {
        beforeEach(() => {
          when(deleteManyMock)
            // @ts-ignore
            .calledWith(
              { $or: expect.arrayContaining(getDeletedDocumentIds().map((_id) => ({ _id }))) as object[] },
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        beforeEach(() => {
          when(insertManyMock)
            // @ts-ignore
            .calledWith(
              expect.arrayContaining(
                getDeletedDocumentIds().map((_id) => ({
                  collectionName,
                  deletedDocumentId: _id,
                  auditRecord,
                  expireAt: expect.any(Date) as Date,
                })),
              ) as DeletionAuditLog[],
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log throws an error', () => {
        beforeEach(() => {
          when(insertManyMock)
            // @ts-ignore
            .calledWith(
              expect.arrayContaining(
                getDeletedDocumentIds().map((_id) => ({
                  collectionName,
                  deletedDocumentId: _id,
                  auditRecord,
                  expireAt: expect.any(Date) as Date,
                })),
              ) as DeletionAuditLog[],
              { session: expect.any(ClientSession) as ClientSession },
            )
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();
      });
    } else {
      it('should delete the documents', async () => {
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
    }

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
