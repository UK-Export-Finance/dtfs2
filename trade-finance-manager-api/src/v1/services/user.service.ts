import { AuditDetails, EntraIdUser, MultipleUsersFoundError, TfmUser, UpsertUserRequest } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_UPSERT_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { UserRepo } from '../repo/user.repo';

type UpsertUserFromEntraIdUserParams = {
  entraIdUser: EntraIdUser;
  auditDetails: AuditDetails;
};

export class UserService {
  /**
   * Used as part of the SSO process
   * Transforms the user data received from Entra ID to a request that can be upserted into the database
   * @param entraIdUser
   * @returns The upsert user request
   */
  public static transformEntraIdUserToUpsertUserRequest(entraIdUser: EntraIdUser): UpsertUserRequest {
    return ENTRA_ID_USER_TO_UPSERT_USER_REQUEST_SCHEMA.parse(entraIdUser);
  }

  /**
   * Used as part of the SSO process
   * Upserts a user from an Entra ID user
   *
   * This upsert works through ensuring that there is only one user with the email addresses provided by the Entra ID user,
   * throwing an error if multiple users are found
   *
   * If no user is found, a new user is created
   * If one user is found, the user is updated
   *
   * Dev note: utilising the current database (Mongo's) upsert was originally considered, however due to the complexity of the upsert logic,
   * it was decided to implement the logic in the service layer for clarity
   *
   * @param upsertUserFromEntraIdUserParams
   * @param upsertUserFromEntraIdUserParams.entraIdUser
   * @param upsertUserFromEntraIdUserParams.auditDetails
   * @returns The upserted user
   * @throws MultipleUsersFoundError if multiple users are found
   */
  public static async upsertUserFromEntraIdUser({ entraIdUser, auditDetails }: UpsertUserFromEntraIdUserParams): Promise<TfmUser> {
    const userUpsertRequest = UserService.transformEntraIdUserToUpsertUserRequest(entraIdUser);
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
