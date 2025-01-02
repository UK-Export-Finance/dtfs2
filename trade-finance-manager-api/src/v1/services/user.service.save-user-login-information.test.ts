import { AuditDetails } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { UserService } from './user.service';
import { UserRepo } from '../repo/user.repo';

jest.mock('../repo/user.repo.ts', () => ({
  UserRepo: {
    updateUserById: jest.fn(),
  },
}));

describe('user service', () => {
  describe('saveUserLoginInformation', () => {
    let auditDetails: AuditDetails;
    let userId: ObjectId;
    let sessionIdentifier: string;
    let updateUserByIdSpy: jest.SpyInstance;
    let userService: UserService;

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      jest.resetAllMocks();
      auditDetails = generateSystemAuditDetails();
      userService = new UserService();
      userId = new ObjectId();
      sessionIdentifier = 'a-session-identifier';

      updateUserByIdSpy = jest.spyOn(UserRepo, 'updateUserById');
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should update the users last login time and session identifier in the database', async () => {
      await userService.saveUserLoginInformation({ userId, sessionIdentifier, auditDetails });

      expect(updateUserByIdSpy).toHaveBeenCalledWith({
        userId,
        userUpdate: {
          lastLogin: Date.now(),
          sessionIdentifier,
        },
        auditDetails,
      });

      expect(updateUserByIdSpy).toHaveBeenCalledTimes(1);
    });
  });
});
