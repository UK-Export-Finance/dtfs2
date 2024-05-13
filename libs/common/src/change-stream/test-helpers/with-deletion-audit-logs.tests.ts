import { Collection, ObjectId, WithoutId } from 'mongodb';
import { MongoDbClient } from '../../mongo-db-client';
import { AuditDatabaseRecord, DeletionAuditLog, MongoDbCollectionName } from '../../types';

type Params = {
  makeRequest: () => Promise<void>;
  collectionName: MongoDbCollectionName;
  auditRecord: AuditDatabaseRecord;
  getDeletedDocumentId: () => ObjectId;
};

export const withDeletionAuditLogsTests = ({
  makeRequest,
  collectionName,
  auditRecord,
  getDeletedDocumentId,
}: Params) => {
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
            _id: expect.anything() as ObjectId,
            collectionName,
            deletedDocumentId: new ObjectId(getDeletedDocumentId()),
            auditRecord,
            expireAt: expect.any(Date) as Date,
          },
        ]);
      });

      it('should delete document', async () => {
        await makeRequest();

        const collection = await mongoDbClient.getCollection(collectionName);
        const deletedDocument = await collection.findOne({ _id: { $eq: getDeletedDocumentId() } });

        expect(deletedDocument).toBe(null);
      });
    });

    // describe('when deleting the document fails', () => {
    //   it('should not add a deletion audit log', async () => {
    //     await makeRequest();

    //     const deletionAuditLogs = await deletionAuditLogsCollection
    //       .find({ collectionName: { $eq: collectionName }, deletedDocumentId: { $eq: getDeletedDocumentId() } })
    //       .toArray();

    //     expect(deletionAuditLogs).toEqual([]);
    //   });
    // });

    // describe('when inserting the audit logs fails', () => {
    //   beforeAll(() => {
    //     jest.resetAllMocks()

    //   });
    //   it('should not add a deletion audit log', async () => {
    //     await makeRequest();

    //     const deletionAuditLogs = await deletionAuditLogsCollection
    //       .find({ collectionName: { $eq: collectionName }, deletedDocumentId: { $eq: getDeletedDocumentId() } })
    //       .toArray();

    //     expect(deletionAuditLogs).toEqual([]);
    //   });
    // });
  });
};
