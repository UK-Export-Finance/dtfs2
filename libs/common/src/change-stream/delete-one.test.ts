import { when } from 'jest-when';
import { ObjectId } from 'mongodb';
import { MongoDbClient } from '../mongo-db-client';
import { generateNoUserLoggedInAuditDetails } from './generate-audit-details';
import { MONGO_DB_COLLECTIONS } from '../constants';
import { generateMockNoUserLoggedInAuditDatabaseRecord } from './test-helpers';
import { deleteOne } from './delete-one';

const mockGetCollection = jest.fn();

const mockDeleteOne = jest.fn();
const mockUsersCollection = {
  deleteOne: mockDeleteOne,
};

const mockInsertOne = jest.fn();
const mockDeletionsCollection = {
  insertOne: mockInsertOne,
};

const mockDb = {
  getCollection: mockGetCollection,
} as unknown as MongoDbClient;

describe('deleteOne', () => {
  const documentId = new ObjectId();
  const originalDeletionAuditLogsDeleteAfterSeconds = process.env.DELETION_AUDIT_LOGS_TTL_SECONDS;
  const originalChangeStreamEnabled = process.env.CHANGE_STREAM_ENABLED;

  afterAll(() => {
    process.env.CHANGE_STREAM_ENABLED = originalChangeStreamEnabled;
    process.env.DELETION_AUDIT_LOGS_TTL_SECONDS = originalDeletionAuditLogsDeleteAfterSeconds;
  });

  describe('when change stream enabled', () => {
    beforeAll(() => {
      process.env.CHANGE_STREAM_ENABLED = 'true';
      process.env.DELETION_AUDIT_LOGS_TTL_SECONDS = '60';
    });

    beforeEach(() => {
      jest.clearAllMocks();

      when(mockGetCollection).calledWith('users').mockReturnValueOnce(mockUsersCollection);
      when(mockGetCollection).calledWith(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS).mockReturnValueOnce(mockDeletionsCollection);
    });

    describe('when the insertion and deletion are successful', () => {
      beforeEach(() => {
        mockDeleteOneSuccess();
        mockInsertOneSuccess();
      });

      it('adds a record to the deletion-audit-logs collection', async () => {
        await deleteOne({
          db: mockDb,
          documentId,
          collectionName: 'users',
          auditDetails: generateNoUserLoggedInAuditDetails(),
        });

        expect(mockDeletionsCollection.insertOne).toHaveBeenCalledWith({
          collectionName: 'users',
          deletedDocumentId: documentId,
          auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
          expireAt: expect.any(Date) as Date,
        });
      });

      it('deletes the requested document', async () => {
        await deleteOne({
          db: mockDb,
          documentId,
          collectionName: 'users',
          auditDetails: generateNoUserLoggedInAuditDetails(),
        });

        expect(mockUsersCollection.deleteOne).toHaveBeenCalledWith({ _id: { $eq: documentId } });
        expect(mockUsersCollection.deleteOne).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when change stream disabled', () => {
    beforeAll(() => {
      process.env.CHANGE_STREAM_ENABLED = 'false';
    });

    beforeEach(() => {
      jest.clearAllMocks();

      when(mockGetCollection).calledWith('users').mockReturnValueOnce(mockUsersCollection);
    });

    it('deletes the requested document', async () => {
      await deleteOne({
        db: mockDb,
        documentId,
        collectionName: 'users',
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(mockUsersCollection.deleteOne).toHaveBeenCalledWith({ _id: { $eq: documentId } });
    });
  });
});

function mockDeleteOneSuccess() {
  when(mockDeleteOne).mockResolvedValue({ acknowledged: true, deletedCount: 1 });
}

function mockInsertOneSuccess() {
  when(mockInsertOne).mockResolvedValue({ acknowledged: true });
}
