import { AuditDetails, EntraIdUser, MultipleUsersFoundError, TfmUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { UserRepo } from '../repo/user.repo';

export class UserService {
  public static transformEntraIdUserToTfmUpsertUserRequest(entraIdUser: EntraIdUser): UserUpsertRequest {
    return ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(entraIdUser);
  }

  public static async upsertUserFromEntraIdUser({ entraIdUser, auditDetails }: { entraIdUser: EntraIdUser; auditDetails: AuditDetails }): Promise<TfmUser> {
    const userUpsertRequest = UserService.transformEntraIdUserToTfmUpsertUserRequest(entraIdUser);
    const findResult = await UserRepo.findUsersByEmailAddresses([...entraIdUser.verified_primary_email, ...entraIdUser.verified_secondary_email]);

    let upsertedUser: TfmUser;
    switch (findResult.length) {
      case 0:
        upsertedUser = await UserRepo.createUser({ user: userUpsertRequest, auditDetails });
        break;
      case 1:
        upsertedUser = await UserRepo.updateUserById({ userId: findResult[0]._id, userUpdate: userUpsertRequest, auditDetails });
        break;
      default:
        throw new MultipleUsersFoundError({ userIdsFound: findResult.map((user) => user._id.toString()) });
    }
    return upsertedUser;
  }
}
