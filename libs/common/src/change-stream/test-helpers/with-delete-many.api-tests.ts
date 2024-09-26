import { Collection, ObjectId, WithoutId } from 'mongodb';
import { when } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';
import { changeStreamConfig } from '../config';

const { CHANGE_STREAM_ENABLED } = changeStreamConfig;

type Params = {
  makeRequest: () => Promise<{ status: number; body: unknown }>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentIds: () => ObjectId[];
  expectedSuccessResponseBody: object;
};

export const withDeleteManyTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentIds, expectedSuccessResponseBody }: Params) => {
  describe(`when deleting many documents from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;
    const deleteManyMock = jest.spyOn(Collection.prototype, 'deleteMany');
    const insertManyMock = jest.spyOn(Collection.prototype, 'insertMany');

    beforeAll(async () => {
      mongoDbClient = new MongoDbClient();

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
        it('should add deletion audit logs', async () => {
          await makeRequest();

          const deletionAuditLogs = await deletionAuditLogsCollection.find({ collectionName, deletedDocumentId: { $in: getDeletedDocumentIds() } }).toArray();

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

        it('should delete the documents', async () => {
          await makeRequest();

          const collection = await mongoDbClient.getCollection(collectionName);
          const deletedDocuments = await collection.find({ _id: { $in: getDeletedDocumentIds() } }).toArray();

          expect(deletedDocuments.length).toBe(0);
        });

        it('should return 200', async () => {
          const { status, body } = await makeRequest();

          expect(status).toBe(200);
          expect(body).toEqual(expectedSuccessResponseBody);
        });
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        beforeEach(() => {
          when(insertManyMock)
            .calledWith(
              // @ts-ignore
              expect.arrayContaining(
                getDeletedDocumentIds().map((id) => ({
                  collectionName,
                  deletedDocumentId: new ObjectId(id),
                  auditRecord,
                  expireAt: expect.any(Date) as Date,
                })),
              ) as WithoutId<DeletionAuditLog>[],
            )
            // @ts-ignore
            .mockResolvedValueOnce({
              acknowledged: false,
            });
        });

        itDoesNotUpdateTheDatabase();
      });

      describe('when inserting the deletion log throws an error', () => {
        beforeEach(() => {
          when(insertManyMock)
            .calledWith(
              // @ts-ignore
              expect.arrayContaining(
                getDeletedDocumentIds().map((id) => ({
                  collectionName,
                  deletedDocumentId: new ObjectId(id),
                  auditRecord,
                  expireAt: expect.any(Date) as Date,
                })),
              ) as WithoutId<DeletionAuditLog>[],
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
        const deletedDocuments = await collection.find({ _id: { $in: getDeletedDocumentIds() } }).toArray();

        expect(deletedDocuments.length).toBe(0);
      });
    }

    function itDoesNotUpdateTheDatabase() {
      it('should not add deletion audit logs', async () => {
        await makeRequest();

        const deletionAuditLogs = await deletionAuditLogsCollection.find({ collectionName, deletedDocumentId: { $in: getDeletedDocumentIds() } }).toArray();
        expect(deletionAuditLogs).toEqual([]);
      });

      it('should not delete the documents', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocuments = await collection.find({ _id: { $in: getDeletedDocumentIds() } }).toArray();

        expect(deletedDocuments.length).toBe(getDeletedDocumentIds().length);
      });

      it('should return a 500', async () => {
        const { status } = await makeRequest();

        expect(status).toBe(500);
      });
    }
  });
};
