import { anEntraIdUser, AuditDetails, EntraIdUser, TfmSessionUser } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mapUserData } from './helpers/mapUserData.helper';
import { UpsertTfmUserFromEntraIdUserResponse, UserService } from '../../services/user.service';
import { upsertTfmUserFromEntraIdUser } from './user.controller';
import { userServiceMockResponses } from '../../../../test-helpers';

describe('user controller', () => {
  describe('upsertTfmUserFromEntraIdUser', () => {
    let entraIdUser: EntraIdUser;
    let auditDetails: AuditDetails;

    let upsertTfmUserFromEntraIdUserResponse: UpsertTfmUserFromEntraIdUserResponse;
    let mappedUserDetails: TfmSessionUser;
    let upsertTfmUserFromEntraIdUserSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.resetAllMocks();
      entraIdUser = anEntraIdUser();
      auditDetails = generateSystemAuditDetails();

      upsertTfmUserFromEntraIdUserResponse = userServiceMockResponses.anUpsertTfmUserFromEntraIdUserResponse();
      mappedUserDetails = mapUserData(upsertTfmUserFromEntraIdUserResponse);

      upsertTfmUserFromEntraIdUserSpy = jest.spyOn(UserService, 'upsertTfmUserFromEntraIdUser').mockResolvedValueOnce(upsertTfmUserFromEntraIdUserResponse);
    });

    it('should upsert user in the database', async () => {
      await upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

      expect(upsertTfmUserFromEntraIdUserSpy).toHaveBeenCalledWith({ entraIdUser, auditDetails });
    });

    it('should return the mapped user', async () => {
      const result = await upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails });

      expect(result).toEqual(mappedUserDetails);
    });
  });
});
