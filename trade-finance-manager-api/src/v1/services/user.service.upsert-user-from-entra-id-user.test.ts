import { AuditDetails, anEntraIdUser, EntraIdUser, TfmUser, UpsertTfmUserRequest } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { USER } from '../../constants';
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

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      jest.resetAllMocks();
      entraIdUser = anEntraIdUser();
      auditDetails = generateSystemAuditDetails();
      transformedUser = UserService.transformEntraIdUserToUpsertTfmUserRequest(entraIdUser);
      userId = new ObjectId();
      existingUser = { ...transformedUser, _id: userId, status: USER.STATUS.ACTIVE };
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('when no users are found with the email addresses', () => {
      beforeEach(() => {
        jest.mocked(UserRepo.findUsersByEmailAddresses.bind(UserRepo)).mockResolvedValue([]);
      });

      it('creates a new user in the database', async () => {
        await UserService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

        expect(UserRepo.createUser.bind(UserRepo)).toHaveBeenCalledWith({
          user: transformedUser,
          auditDetails,
        });
      });
    });

    describe('when one user is found with the email addresses', () => {
      beforeEach(() => {
        jest.mocked(UserRepo.findUsersByEmailAddresses.bind(UserRepo)).mockResolvedValue([existingUser]);
      });

      it('updates the user in the database', async () => {
        await UserService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

        expect(jest.mocked(UserRepo.updateUserById.bind(UserRepo))).toHaveBeenCalledWith({
          userId,
          userUpdate: transformedUser,
          auditDetails,
        });
      });
    });

    describe('when multiple users are found with the email addresses', () => {
      beforeEach(() => {
        jest.mocked(UserRepo.findUsersByEmailAddresses.bind(UserRepo)).mockResolvedValue([existingUser, existingUser]);
      });

      it('throws an error', async () => {
        await expect(UserService.upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails })).rejects.toThrowError();
      });
    });
  });
});
