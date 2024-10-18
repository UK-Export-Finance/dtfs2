import { AuditDetails, EntraIdUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { UserRepo } from '../repo/user.repo';

export class UserService {
  private static transformEntraIdUserToTfmUserUpsert(entraIdUser: EntraIdUser): UserUpsertRequest {
    return ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(entraIdUser);
  }

  public static async upsertUserFromEntraIdUser({ entraIdUser, auditDetails }: { entraIdUser: EntraIdUser; auditDetails: AuditDetails }): Promise<void> {
    await UserRepo.upsertUser({
      emailsOfUserToUpsert: [...entraIdUser.verified_primary_email, ...entraIdUser.verified_secondary_email],
      userUpsertRequest: this.transformEntraIdUserToTfmUserUpsert(entraIdUser),
      auditDetails,
    });
  }
}
