import {
  AuditDatabaseRecord,
  AuditDetails,
  aValidUserUpsertRequest,
  DocumentNotUpdatedError,
  MONGO_DB_COLLECTIONS,
  TfmUser,
  UserUpsertRequest,
} from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { FindOneAndUpdateOptions, ModifyResult, ObjectId, WithId } from 'mongodb';
import { mongoDbClient } from '../../drivers/db-client';
import { UserRepo } from './user.repo';
import { USER } from '../../constants';

let findOneAndUpdateMock = jest.fn();
let getCollectionMock = jest.fn();

describe('user repo', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getCollectionMock.mockResolvedValue({
      findOneAndUpdate: findOneAndUpdateMock,
    });
  });

  describe('update user by id', () => {
    let updateUserRequest: UserUpsertRequest;
    let updateUserDatabaseRequest: UserUpsertRequest & { auditRecord: AuditDatabaseRecord };
    let updateUserDatabaseResponse: WithId<TfmUser>;
    let auditDetails: AuditDetails;
    let auditRecord: AuditDatabaseRecord;
    let userId: ObjectId;

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      auditDetails = generateSystemAuditDetails();
      auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

      updateUserRequest = aValidUserUpsertRequest();
      updateUserDatabaseRequest = { ...updateUserRequest, auditRecord };
      updateUserDatabaseResponse = { ...updateUserDatabaseRequest, _id: userId, status: USER.STATUS.ACTIVE };

      userId = new ObjectId();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('when the update is successful', () => {
      beforeEach(() => {
        mockSuccessfulFindOneAndUpdateResponse();
      });

      it('calls the tfm user collection', async () => {
        await makeRequest();

        expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.TFM_USERS);
      });

      it('updates a user', async () => {
        const filter = { _id: { $eq: userId } };
        const update = {
          $set: {
            ...updateUserDatabaseRequest,
            auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
          },
        };
        const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

        await makeRequest();

        expect(findOneAndUpdateMock).toHaveBeenCalledWith(filter, update, options);
      });

      it('returns the updated user', async () => {
        const result = await makeRequest();

        expect(result).toEqual(updateUserDatabaseResponse);
      });
    });

    describe('when the update is unsuccessful', () => {
      beforeEach(() => {
        mockUnsuccessfulFindOneAndUpdateResponse();
      });

      it('throws an error', async () => {
        await expect(makeRequest()).rejects.toThrow(DocumentNotUpdatedError);
      });
    });

    function mockFindOneAndUpdateResponse(response: ModifyResult) {
      findOneAndUpdateMock = jest.fn(() => response);
      getCollectionMock = jest.fn().mockResolvedValue({
        ...getCollectionMock,
        findOneAndUpdate: findOneAndUpdateMock,
      });

      jest.spyOn(mongoDbClient, 'getCollection').mockImplementation(getCollectionMock);
    }

    function mockSuccessfulFindOneAndUpdateResponse() {
      mockFindOneAndUpdateResponse({ ok: 1, value: updateUserDatabaseResponse });
    }

    function mockUnsuccessfulFindOneAndUpdateResponse() {
      mockFindOneAndUpdateResponse({ ok: 0, value: null });
    }

    async function makeRequest() {
      return UserRepo.updateUserById({ userId, userUpdate: updateUserRequest, auditDetails });
    }
  });
});
