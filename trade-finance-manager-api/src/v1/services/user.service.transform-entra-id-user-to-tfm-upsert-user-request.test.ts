import { anEntraIdUser } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { UserService } from './user.service';

describe('user service', () => {
  describe('transformEntraIdUserToUpsertTfmUserRequest', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('transforms an entra id user to a tfm upsert user request', () => {
      const validEntraIdUser = anEntraIdUser();
      const expected = ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA.parse(validEntraIdUser);
      const result = UserService.transformEntraIdUserToUpsertTfmUserRequest(validEntraIdUser);

      expect(result).toEqual(expected);
    });
  });
});
