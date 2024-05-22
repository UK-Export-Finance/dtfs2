import { Binary, ChangeStreamInsertDocument, ObjectId } from 'mongodb';
import axios from 'axios';
import { postAuditDetails } from './changeStreamApi.ts';

jest.mock('axios', () => jest.fn(() => Promise.resolve('mockResponse')));

describe('changeStreamApi', () => {
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
});
