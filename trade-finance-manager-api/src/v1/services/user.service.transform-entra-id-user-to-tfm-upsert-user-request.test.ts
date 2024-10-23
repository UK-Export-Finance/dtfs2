import { aValidEntraIdUser } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { UserService } from './user.service';

describe('user service', () => {
  describe('transformEntraIdUserToTfmUpsertUserRequest', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('transforms an entra id user to a tfm upsert user request', () => {
      const validEntraIdUser = aValidEntraIdUser();
      const expectedResult = ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(validEntraIdUser);
      const result = UserService.transformEntraIdUserToTfmUpsertUserRequest(validEntraIdUser);
      expect(result).toEqual(expectedResult);
    });
  });
});
