import {
  AuditDatabaseRecord,
  AuditDetails,
  DocumentNotCreatedError,
  MONGO_DB_COLLECTIONS,
  TfmUser,
  CreateTfmUserRequest,
  aCreateTfmUserRequest,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { InsertOneResult, ObjectId, WithoutId } from 'mongodb';
import { mongoDbClient } from '../../drivers/db-client';
import { UserRepo } from './user.repo';
import { USER } from '../../constants';

let insertOneMock = jest.fn();
let getCollectionMock = jest.fn();

describe('user repo', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getCollectionMock.mockResolvedValue({
      insertOne: insertOneMock,
    });
  });

  describe('create user', () => {
    let createTfmUserRequest: CreateTfmUserRequest;
    let createUserDatabaseRequest: WithoutId<TfmUser>;
    let auditDetails: AuditDetails;
    let auditRecord: AuditDatabaseRecord;
    let insertedId: ObjectId;

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      auditDetails = generateSystemAuditDetails();
      auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      createTfmUserRequest = aCreateTfmUserRequest();
      createUserDatabaseRequest = { ...createTfmUserRequest, status: USER.STATUS.ACTIVE, auditRecord };

      insertedId = new ObjectId();
    });

    afterAll(() => {
      jest.useRealTimers();
    });
    describe('when the create user is successful', () => {
      beforeEach(() => {
        mockSuccessfulInsertOneResponse();
      });

      it('calls the tfm user collection', async () => {
        await makeRequest();

        expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_USERS);
        expect(getCollectionMock).toHaveBeenCalledTimes(1);
      });

      it('creates a user', async () => {
        await makeRequest();
        expect(insertOneMock).toHaveBeenCalledWith(createUserDatabaseRequest);
        expect(insertOneMock).toHaveBeenCalledTimes(1);
      });

      it('returns the created user', async () => {
        const result = await makeRequest();
        expect(result).toEqual({ _id: insertedId, ...createUserDatabaseRequest, auditRecord });
      });
    });

    describe('when the create user is unsuccessful', () => {
      beforeEach(() => {
        mockUnsuccessfulInsertOneResponse();
      });

      it('throws an error', async () => {
        await expect(makeRequest()).rejects.toThrow(DocumentNotCreatedError);
      });
    });

    function mockInsertOneResponse(response: InsertOneResult<TfmUser>) {
      insertOneMock = jest.fn(() => response);
      getCollectionMock = jest.fn().mockResolvedValue({
        ...getCollectionMock,
        insertOne: insertOneMock,
      });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    }

    function mockSuccessfulInsertOneResponse() {
      mockInsertOneResponse({ acknowledged: true, insertedId });
    }

    function mockUnsuccessfulInsertOneResponse() {
      mockInsertOneResponse({ acknowledged: false, insertedId });
    }

    async function makeRequest() {
      return UserRepo.createUser({ user: createTfmUserRequest, auditDetails });
    }
  });
});
