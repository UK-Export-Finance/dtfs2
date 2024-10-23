import { when, resetAllWhenMocks } from 'jest-when';
import { mapUserData } from './helpers/mapUserData.helper';
import { UserService } from '../../services/user.service';
import { upsertTfmUserFromEntraIdUser } from './user.controller';

jest.mock('../../services/user.service', () => ({
  __esModule: true,
  UserService: {
    upsertUserFromEntraIdUser: jest.fn(),
  },
}));

jest.mock('./helpers/mapUserData.helper', () => ({
  mapUserData: jest.fn(),
}));

describe('user controller', () => {
  describe('upsertTfmUserFromEntraIdUser', () => {
    const entraIdUser = 'anEntraIdUser';
    const auditDetails = 'auditDetails';

    const upsertedUserResponse = 'upsertedUserResponse';
    const mappedUserDetails = 'mappedUserDetails';

    beforeEach(() => {
      jest.resetAllMocks();
      resetAllWhenMocks();
      when(jest.mocked(UserService.upsertUserFromEntraIdUser)).calledWith({ entraIdUser, auditDetails }).mockResolvedValue(upsertedUserResponse);
      when(jest.mocked(mapUserData)).calledWith(upsertedUserResponse).mockReturnValue(mappedUserDetails);
    });

    it('should upsert user in the database', async () => {
      await makeRequest();

      expect(UserService.upsertUserFromEntraIdUser).toHaveBeenCalledWith({ entraIdUser, auditDetails });
    });

    it('should map the user', async () => {
      await makeRequest();

      expect(mapUserData).toHaveBeenCalledWith(upsertedUserResponse);
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
