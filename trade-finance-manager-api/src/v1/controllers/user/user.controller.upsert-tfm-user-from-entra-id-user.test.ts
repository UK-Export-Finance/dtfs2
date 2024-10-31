import { when, resetAllWhenMocks } from 'jest-when';
import { anEntraIdUser, AuditDetails, EntraIdUser } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mapUserData } from './helpers/mapUserData.helper';
import { UpsertTfmUserFromEntraIdUserResponse, UserService } from '../../services/user.service';
import { upsertTfmUserFromEntraIdUser } from './user.controller';
import { userServiceMockResponses } from '../../../../test-helpers';
import { TfmSessionUser } from '../../../types/tfm-session-user';

jest.mock('../../services/user.service', () => ({
  __esModule: true,
  UserService: {
    upsertTfmUserFromEntraIdUser: jest.fn(),
  },
}));

describe('user controller', () => {
  describe('upsertTfmUserFromEntraIdUser', () => {
    let entraIdUser: EntraIdUser;
    let auditDetails: AuditDetails;

    let upsertTfmUserFromEntraIdUserResponse: UpsertTfmUserFromEntraIdUserResponse;
    let mappedUserDetails: TfmSessionUser;

    beforeEach(() => {
      jest.resetAllMocks();
      resetAllWhenMocks();
      entraIdUser = anEntraIdUser();
      auditDetails = generateSystemAuditDetails();

      upsertTfmUserFromEntraIdUserResponse = userServiceMockResponses.anUpsertTfmUserFromEntraIdUserResponse();
      mappedUserDetails = mapUserData(upsertTfmUserFromEntraIdUserResponse);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      when(UserService.upsertTfmUserFromEntraIdUser).calledWith({ entraIdUser, auditDetails }).mockResolvedValue(upsertTfmUserFromEntraIdUserResponse);
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
