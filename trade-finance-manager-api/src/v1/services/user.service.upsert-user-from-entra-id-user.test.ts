import { USER_STATUS, AuditDetails, anEntraIdUser, EntraIdUser, TfmUser, UpsertTfmUserRequest } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { UserService } from './user.service';
import { UserRepo } from '../repo/user.repo';

jest.mock('../repo/user.repo.ts', () => ({
  UserRepo: {
    findUsersByEmailAddresses: jest.fn(),
    createUser: jest.fn(),
    updateUserById: jest.fn(),
  },
}));

describe('user service', () => {
  describe('upsertTfmUserFromEntraIdUser', () => {
    let entraIdUser: EntraIdUser;
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
      entraIdUser = anEntraIdUser();
      auditDetails = generateSystemAuditDetails();
      userService = new UserService();
      transformedUser = userService.transformEntraIdUserToUpsertTfmUserRequest(entraIdUser);
      userId = new ObjectId();
      existingUser = { ...transformedUser, _id: userId, status: USER_STATUS.ACTIVE };
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('when no users are found with the email addresses', () => {
      beforeEach(() => {
        jest.spyOn(UserRepo, 'findUsersByEmailAddresses').mockResolvedValue([]);
        createUserSpy = jest.spyOn(UserRepo, 'createUser');
      });

      it('creates a new user in the database', async () => {
        await userService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

        expect(createUserSpy).toHaveBeenCalledWith({
          user: transformedUser,
          auditDetails,
        });
        expect(createUserSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when one user is found with the email addresses', () => {
      beforeEach(() => {
        jest.spyOn(UserRepo, 'findUsersByEmailAddresses').mockResolvedValue([existingUser]);
        updateUserByIdSpy = jest.spyOn(UserRepo, 'updateUserById');
      });

      it('updates the user in the database', async () => {
        await userService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

        expect(updateUserByIdSpy).toHaveBeenCalledWith({
          userId,
          userUpdate: transformedUser,
          auditDetails,
        });
        expect(updateUserByIdSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when multiple users are found with the email addresses', () => {
      beforeEach(() => {
        jest.spyOn(UserRepo, 'findUsersByEmailAddresses').mockResolvedValue([existingUser, existingUser]);
      });

      it('throws an error', async () => {
        await expect(userService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails })).rejects.toThrowError();
      });
    });
  });
});
