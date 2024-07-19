import { Binary, ChangeStreamInsertDocument, ObjectId } from 'mongodb';
import axios from 'axios';
import { DeletionAuditLog } from '@ukef/dtfs2-common';
import { postAuditDetails, postDeletionAuditDetails } from './changeStreamApi';

jest.mock('axios', () => jest.fn(() => Promise.resolve('mockResponse')));

describe('changeStreamApi', () => {
  const originalProcessEnv = { ...process.env };
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalProcessEnv,
      AUDIT_API_URL: 'audit API url',
      AUDIT_API_USERNAME: 'audit API username',
      AUDIT_API_PASSWORD: 'audit API password',
    };
  });

  afterAll(() => {
    process.env = originalProcessEnv;
  });

  describe('postAuditDetails', () => {
    const mockChangeStreamDocument: ChangeStreamInsertDocument = {
      _id: '123',
      collectionUUID: new Binary(Buffer.from('123')),
      fullDocument: {},
      operationType: 'insert',
      ns: {
        coll: 'mockCollection',
        db: 'mockDb',
      },
      documentKey: {
        _id: new ObjectId(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      process.env = {
        ...process.env,
        AUDIT_API_URL: 'audit API url',
        AUDIT_API_USERNAME: 'audit API username',
        AUDIT_API_PASSWORD: 'audit API password',
      };
    });

    it('should call api when called with a valid change stream document', async () => {
      await postAuditDetails(mockChangeStreamDocument);

      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: expect.any(String) as string,
        headers: {
          Authorization: expect.any(String) as string,
          'Content-Type': 'text/plain',
          Accept: 'application/json',
          integrationHubCollectionName: 'mockCollection',
          integrationHubItemId: mockChangeStreamDocument.documentKey._id.toString(),
          integrationHubProcess: 'dtfs',
        },
        data: mockChangeStreamDocument.fullDocument,
      });
    });

    const envVarTestCases = [{ envVarName: 'AUDIT_API_URL' }, { envVarName: 'AUDIT_API_USERNAME' }, { envVarName: 'AUDIT_API_PASSWORD' }];
    it.each(envVarTestCases)('should throw an error if the %envVarName env var is missing', async ({ envVarName }) => {
      delete process.env[envVarName];

      await expect(postAuditDetails(mockChangeStreamDocument)).rejects.toThrow();
    });
  });

  describe('postDeletionAuditDetails', () => {
    const now = new Date();
    const mockDeletionChangeStreamDocument: ChangeStreamInsertDocument<DeletionAuditLog> = {
      _id: '123',
      collectionUUID: new Binary(Buffer.from('123')),
      fullDocument: {
        collectionName: 'mockCollection',
        _id: new ObjectId(),
        deletedDocumentId: new ObjectId(),
        auditRecord: {
          lastUpdatedAt: now.toISOString(),
          lastUpdatedByIsSystem: null,
          lastUpdatedByPortalUserId: null,
          lastUpdatedByTfmUserId: null,
          noUserLoggedIn: true,
        },
        expireAt: now,
      },
      operationType: 'insert',
      ns: {
        coll: 'deletion-audit-logs',
        db: 'mockDb',
      },
      documentKey: {
        _id: new ObjectId(),
      },
    };

    it('should call the change stream api when called with a valid change stream document', async () => {
      await postDeletionAuditDetails(mockDeletionChangeStreamDocument);

      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: expect.any(String) as string,
        headers: {
          Authorization: expect.any(String) as string,
          'Content-Type': 'text/plain',
          Accept: 'application/json',
          integrationHubCollectionName: 'mockCollection',
          integrationHubItemId: mockDeletionChangeStreamDocument.fullDocument.deletedDocumentId.toString(),
          integrationHubProcess: 'dtfs',
        },
        data: {
          auditRecord: {
            deletedAt: now.toISOString(),
            deletedByPortalUserId: null,
            deletedByTfmUserId: null,
            deletedByIsSystem: null,
            deletedByNoUserLoggedIn: true,
          },
        },
      });
    });

    const envVarTestCases = [{ envVarName: 'AUDIT_API_URL' }, { envVarName: 'AUDIT_API_USERNAME' }, { envVarName: 'AUDIT_API_PASSWORD' }];
    it.each(envVarTestCases)('should throw an error if the %envVarName env var is missing', async ({ envVarName }) => {
      delete process.env[envVarName];

      await expect(postDeletionAuditDetails(mockDeletionChangeStreamDocument)).rejects.toThrow();
    });
  });
});
