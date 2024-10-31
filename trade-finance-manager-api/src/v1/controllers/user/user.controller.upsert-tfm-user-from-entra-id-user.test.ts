import { when, resetAllWhenMocks } from 'jest-when';
import { anEntraIdUser } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mapUserData } from './helpers/mapUserData.helper';
import { UserService } from '../../services/user.service';
import { upsertTfmUserFromEntraIdUser } from './user.controller';
import { userServiceMockResponses } from '../../../../test-helpers';

jest.mock('../../services/user.service', () => ({
  __esModule: true,
  UserService: {
    upsertTfmUserFromEntraIdUser: jest.fn(),
  },
}));

describe('user controller', () => {
  describe('upsertTfmUserFromEntraIdUser', () => {
    const entraIdUser = anEntraIdUser();
    const auditDetails = generateSystemAuditDetails();

    const upsertedUserResponse = userServiceMockResponses.anUpsertTfmUserFromEntraIdUserResponse();
    const mappedUserDetails = mapUserData(upsertedUserResponse);

    beforeEach(() => {
      jest.resetAllMocks();
      resetAllWhenMocks();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      when(UserService.upsertTfmUserFromEntraIdUser).calledWith({ entraIdUser, auditDetails }).mockResolvedValue(upsertedUserResponse);
    });

    it('should upsert user in the database', async () => {
      await makeRequest();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(UserService.upsertTfmUserFromEntraIdUser).toHaveBeenCalledWith({ entraIdUser, auditDetails });
    });

    it('should return the mapped user', async () => {
      const result = await makeRequest();

      expect(result).toEqual(mappedUserDetails);
    });

    async function makeRequest() {
      return await upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });
    }
  });
});
