import { EntraIdUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA } from '@ukef/dtfs2-common/schemas';

export class UserService {
  public static transformEntraUserToTfmUserUpsert(entraUser: EntraIdUser): UserUpsertRequest {
    return ENTRA_ID_USER_TO_TFM_UPSERT_REQUEST_SCHEMA.parse(entraUser);
  }
}
