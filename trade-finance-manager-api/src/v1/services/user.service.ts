import { AuditDetails, EntraIdUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { UserRepo } from '../repo/user.repo';

export class UserService {
  private static transformEntraUserToTfmUserUpsert(entraUser: EntraIdUser): UserUpsertRequest {
    return ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(entraUser);
  }

  public static async upsertUserFromEntraIdUser({ entraUser, auditDetails }: { entraUser: EntraIdUser; auditDetails: AuditDetails }): Promise<void> {
    await UserRepo.upsertUser({
      emailsOfUserToUpsert: [...entraUser.verified_primary_email, ...entraUser.verified_secondary_email],
      userUpsertRequest: this.transformEntraUserToTfmUserUpsert(entraUser),
      auditDetails,
    });
  }
}
