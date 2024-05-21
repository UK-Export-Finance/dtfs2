import { when } from 'jest-when';
import { ObjectId } from 'mongodb';
import { MongoDbClient } from '../mongo-db-client';
import { deleteDocumentWithAuditLogs } from './delete-document-with-audit-logs';
import { generateNoUserLoggedInAuditDetails } from './generate-audit-details';
import { MONGO_DB_COLLECTIONS } from '../constants';
import { generateMockNoUserLoggedInAuditDatabaseRecord } from './test-helpers';

const mockSession = {
  withTransaction: jest.fn((callback: () => void) => {
    callback();
  }),
  endSession: jest.fn(),
};

const mockClient = {
  startSession: jest.fn(() => mockSession),
};

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
  getClient: jest.fn(() => mockClient),
  getCollection: mockGetCollection,
} as unknown as MongoDbClient;

describe('deleteDocumentWithAuditLogs', () => {
  const documentId = new ObjectId();
  const originalDeletionAuditLogsDeleteAfterSeconds = process.env.DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS;

  beforeEach(() => {
    process.env.DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS = '60';

    jest.clearAllMocks();

    when(mockGetCollection).calledWith('users').mockReturnValueOnce(mockUsersCollection);
    when(mockGetCollection).calledWith(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS).mockReturnValueOnce(mockDeletionsCollection);
  });

  afterAll(() => {
    process.env.DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS = originalDeletionAuditLogsDeleteAfterSeconds;
  });

  describe('when the insertion and deletion are successful', () => {
    beforeEach(() => {
      mockDeleteOneSuccess();
      mockInsertOneSuccess();
    });

    it('adds a record to the deletion-audit-logs collection', async () => {
      await deleteDocumentWithAuditLogs({
        db: mockDb,
        documentId,
        collectionName: 'users',
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(mockDeletionsCollection.insertOne).toHaveBeenCalledWith(
        {
          collectionName: 'users',
          deletedDocumentId: documentId,
          auditRecord: generateMockNoUserLoggedInAuditDatabaseRecord(),
          expireAt: expect.any(Date) as Date,
        },
        { session: mockSession },
      );
    });

    it('adds deletes the requested record', async () => {
      await deleteDocumentWithAuditLogs({
        db: mockDb,
        documentId,
        collectionName: 'users',
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(mockUsersCollection.deleteOne).toHaveBeenCalledWith({ _id: { $eq: documentId } }, { session: mockSession });
    });

    it('ends the session', async () => {
      await deleteDocumentWithAuditLogs({
        db: mockDb,
        documentId,
        collectionName: 'users',
        auditDetails: generateNoUserLoggedInAuditDetails(),
      });

      expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    });
  });
});

function mockDeleteOneSuccess() {
  when(mockDeleteOne).mockResolvedValue({ acknowledged: true, deletedCount: 1 });
}

function mockInsertOneSuccess() {
  when(mockInsertOne).mockResolvedValue({ acknowledged: true });
}
