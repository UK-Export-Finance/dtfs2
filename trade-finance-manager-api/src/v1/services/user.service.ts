import { AuditDetails, EntraIdUser, TfmUser, UpsertTfmUserRequest } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { ObjectId } from 'mongodb';
import { UserRepo } from '../repo/user.repo';

export type UpsertTfmUserFromEntraIdUserParams = {
  entraIdUser: EntraIdUser;
  auditDetails: AuditDetails;
};

export type SaveUserLoginInformationParams = {
  userId: ObjectId;
  sessionIdentifier: string;
  auditDetails: AuditDetails;
};

export type UpsertTfmUserFromEntraIdUserResponse = TfmUser;

/**
 * User service, primarily used for SSO.
 * Note: User repo is not dependency injected as a constructor as it may be used in non-DI code
 * DI code is only used for SSO due to existing documentation and other implementations
 */
export class UserService {
  /**
   * Used as part of the SSO process
   * Transforms the user data received from Entra ID to a request that can be upserted into the database
   * @param entraIdUser
   * @returns The upsert user request
   */
  public transformEntraIdUserToUpsertTfmUserRequest(entraIdUser: EntraIdUser): UpsertTfmUserRequest {
    return ENTRA_ID_USER_TO_UPSERT_TFM_USER_REQUEST_SCHEMA.parse(entraIdUser);
  }

  /**
   * Used as part of the SSO process
   *
   * Upserts a user from an Entra ID user
   *
   * This upsert works through ensuring that there is only one user with the email addresses provided by the Entra ID user,
   * throwing an error if multiple users are found
   *
   * If no user is found, a new user is created,
   * If one user is found, the user is updated
   *
   * Dev note: utilising the current database (Mongo's) upsert was originally considered, however due to the complexity of the upsert logic,
   * it was decided to implement the logic in the service layer for clarity
   *
   * @param upsertTfmUserFromEntraIdUserParams
   * @param upsertTfmUserFromEntraIdUserParams.entraIdUser
   * @param upsertTfmUserFromEntraIdUserParams.auditDetails
   * @returns The upserted user
   * @throws MultipleUsersFoundError if multiple users are found
   */
  public async upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails }: UpsertTfmUserFromEntraIdUserParams): Promise<UpsertTfmUserFromEntraIdUserResponse> {
    const upsertTfmUserRequest = this.transformEntraIdUserToUpsertTfmUserRequest(entraIdUser);
    const findResult = await UserRepo.findUserByEmailAddress(entraIdUser.email);

    const upsertedUser = findResult
      ? await UserRepo.updateUserById({ userId: findResult._id, userUpdate: upsertTfmUserRequest, auditDetails })
      : await UserRepo.createUser({ user: upsertTfmUserRequest, auditDetails });

    return upsertedUser;
  }

  public async saveUserLoginInformation({ userId, sessionIdentifier, auditDetails }: SaveUserLoginInformationParams) {
    await UserRepo.updateUserById({
      userId,
      userUpdate: {
        lastLogin: Date.now(),
        sessionIdentifier,
      },
      auditDetails,
    });
  }
}
