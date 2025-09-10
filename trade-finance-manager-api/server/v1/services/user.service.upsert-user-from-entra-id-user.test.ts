import { anEntraIdUser } from "@ukef/dtfs2-common/test-helpers";
import { USER_STATUS, AuditDetails, EntraIdUser, TfmUser, UpsertTfmUserRequest } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { UserService } from './user.service';
import { UserRepo } from '../repo/user.repo';

jest.mock('../repo/user.repo.ts', () => ({
  UserRepo: {
    findUserByEmailAddress: jest.fn(),
    createUser: jest.fn(),
    updateUserById: jest.fn(),
  },
}));

describe('user service', () => {
  describe('upsertTfmUserFromEntraIdUser', () => {
    let idTokenClaims: EntraIdUser;
    let auditDetails: AuditDetails;
    let transformedUser: UpsertTfmUserRequest;
    let existingUser: TfmUser;
    let userId: ObjectId;
    let createUserSpy: jest.SpyInstance;
    let updateUserByIdSpy: jest.SpyInstance;
    let userService: UserService;

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      jest.resetAllMocks();
      idTokenClaims = anEntraIdUser();
      auditDetails = generateSystemAuditDetails();
      userService = new UserService();
      transformedUser = userService.transformEntraIdUserToUpsertTfmUserRequest(idTokenClaims);
      userId = new ObjectId();
      existingUser = { ...transformedUser, _id: userId, status: USER_STATUS.ACTIVE };
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('when no users are found with the email address', () => {
      beforeEach(() => {
        jest.spyOn(UserRepo, 'findUserByEmailAddress').mockResolvedValue(null);
        createUserSpy = jest.spyOn(UserRepo, 'createUser');
      });

      it('should create a new user in the database', async () => {
        await userService.upsertTfmUserFromEntraIdUser({ idTokenClaims, auditDetails });

        expect(createUserSpy).toHaveBeenCalledWith({
          user: transformedUser,
          auditDetails,
        });
        expect(createUserSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when one user is found with the email address', () => {
      beforeEach(() => {
        jest.spyOn(UserRepo, 'findUserByEmailAddress').mockResolvedValue(existingUser);
        updateUserByIdSpy = jest.spyOn(UserRepo, 'updateUserById');
      });

      it('should update the user in the database', async () => {
        await userService.upsertTfmUserFromEntraIdUser({ idTokenClaims, auditDetails });

        expect(updateUserByIdSpy).toHaveBeenCalledWith({
          userId,
          userUpdate: transformedUser,
          auditDetails,
        });
        expect(updateUserByIdSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
