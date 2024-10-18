import { AuditDatabaseRecord, AuditDetails, aValidUserUpsertRequest, MONGO_DB_COLLECTIONS, UserUpsertRequest } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';
import { UserRepo } from './user.repo';

let findOneAndUpdateMock = jest.fn();
let getCollectionMock = jest.fn();

jest.mock('@ukef/dtfs2-common/change-stream', () => ({
  generateAuditDatabaseRecordFromAuditDetails: jest.fn(),
}));

describe('user repo', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getCollectionMock.mockResolvedValue({
      updateOne: findOneAndUpdateMock,
    });
  });

  describe('upsertUser', () => {
    let userUpsertRequest: UserUpsertRequest;
    let auditDetails: AuditDetails;
    let emailsOfUserToUpsert: string[];

    const mockAuditRecordResponse = 'example audit record';

    beforeEach(() => {
      userUpsertRequest = aValidUserUpsertRequest();
      auditDetails = generateSystemAuditDetails();
      emailsOfUserToUpsert = ['an-email', 'another-email'];
    });

    describe('when the update is successful', () => {
      beforeEach(() => {
        mockSuccessfulGenerateAuditDatabaseRecordFromAuditDetails();
        mockSuccessfulUpdateOneResponse();
      });

      it('calls the correct collection', async () => {
        mockSuccessfulGenerateAuditDatabaseRecordFromAuditDetails();
        mockSuccessfulUpdateOneResponse();

        await makeRequest();

        expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_USERS);
      });

      it('calls the database with the correct parameters', async () => {
        mockSuccessfulGenerateAuditDatabaseRecordFromAuditDetails();
        mockSuccessfulUpdateOneResponse();

        const expectedEmailsParsedByRegex = ['^an//-email$', '^another//-email$'];
        const expectedQuery = { email: { $in: expectedEmailsParsedByRegex } };
        const expectedOptions = { upsert: true, returnDocument: 'after' };

        const expectedUpdate = { ...userUpsertRequest, auditRecord: mockAuditRecordResponse };

        await makeRequest();

        expect(findOneAndUpdateMock).toHaveBeenCalledWith(expectedQuery, expectedUpdate, expectedOptions);
      });

      it('returns the updated user', async () => {
        const result = await UserRepo.upsertUser({ emailsOfUserToUpsert, userUpsertRequest, auditDetails });

        expect(result).toEqual('example response object');
      });
    });

    describe('when the update is unsuccessful', () => {
      beforeEach(() => {
        mockSuccessfulGenerateAuditDatabaseRecordFromAuditDetails();
        mockUnsuccessfulUpdateOneResponse();
      });

      it('throws an error', async () => {
        await expect(makeRequest()).rejects.toThrow('Failed to upsert user');
      });
    });

    function mockSuccessfulUpdateOneResponse() {
      findOneAndUpdateMock = jest.fn(() => ({ value: 'example response object', ok: 1 }));
      getCollectionMock = jest.fn().mockResolvedValue({
        findOneAndUpdate: findOneAndUpdateMock,
      });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    }

    function mockSuccessfulGenerateAuditDatabaseRecordFromAuditDetails() {
      jest.mocked(generateAuditDatabaseRecordFromAuditDetails).mockReturnValue(mockAuditRecordResponse as unknown as AuditDatabaseRecord);
    }

    function mockUnsuccessfulUpdateOneResponse() {
      findOneAndUpdateMock.mockResolvedValue({ value: null, ok: 0 });
    }

    async function makeRequest() {
      await UserRepo.upsertUser({ emailsOfUserToUpsert, userUpsertRequest, auditDetails });
    }
  });
});
