import { Collection, ObjectId, WithoutId } from 'mongodb';
import { Response } from 'supertest';
import { when } from 'jest-when';
import { MongoDbClient } from '../../mongo-db-client';
import { ApiErrorResponseBody, AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';
import { changeStreamConfig } from '../config';

const { CHANGE_STREAM_ENABLED } = changeStreamConfig;

interface ApiErrorResponse extends Response {
  body: ApiErrorResponseBody;
}

type Params = {
  makeRequest: () => Promise<ApiErrorResponse>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentId: () => ObjectId;
};

export const withDeleteOneTests = ({ makeRequest, collectionName, auditRecord, getDeletedDocumentId }: Params) => {
  describe(`when deleting a document from ${collectionName}`, () => {
    let mongoDbClient: MongoDbClient;
    let deletionAuditLogsCollection: Collection<WithoutId<DeletionAuditLog>>;
    const mockDeleteOne = jest.spyOn(Collection.prototype, 'deleteOne');
    const mockInsertOne = jest.spyOn(Collection.prototype, 'insertOne');

    beforeAll(async () => {
      mongoDbClient = new MongoDbClient();

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
              expireAt: expect.any(Date) as Date,
            },
          ]);
        });

        it('should delete the document', async () => {
          await makeRequest();

          const collection = await mongoDbClient.getCollection(collectionName);
          const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

          expect(deletedDocument).toEqual(null);
        });

        it('should return 200', async () => {
          const { status } = await makeRequest();

          expect(status).toEqual(200);
        });
      });

      describe('when inserting the deletion log is not acknowledged', () => {
        beforeEach(() => {
          when(mockInsertOne)
            .calledWith({
              // @ts-ignore
              collectionName,
              deletedDocumentId: getDeletedDocumentId(),
              auditRecord,
              expireAt: expect.any(Date) as Date,
            })
            .mockImplementationOnce(() => ({
              acknowledged: false,
            }));
        });

        itDoesNotUpdateTheDatabase();

        it('should return 500', async () => {
          const { status } = await makeRequest();

          expect(status).toEqual(500);
        });
      });

      describe('when inserting the deletion log throws an error', () => {
        beforeEach(() => {
          when(mockInsertOne)
            .calledWith({
              // @ts-ignore
              collectionName,
              deletedDocumentId: getDeletedDocumentId(),
              auditRecord,
              expireAt: expect.any(Date) as Date,
            })
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        itDoesNotUpdateTheDatabase();

        it('should return 500', async () => {
          const { status } = await makeRequest();

          expect(status).toEqual(500);
        });
      });
    } else {
      it('should delete the document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(deletedDocument).toEqual(null);
      });

      it('should return 200', async () => {
        const { status } = await makeRequest();

        expect(status).toEqual(200);
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
