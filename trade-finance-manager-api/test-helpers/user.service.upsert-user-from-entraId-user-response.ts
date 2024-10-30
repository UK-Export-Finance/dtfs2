import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { UpsertTfmUserFromEntraIdUserResponse } from '../src/v1/services/user.service';

export const userServiceMockResponses = {
  aUpsertTfmUserFromEntraIdUserResponse: (): UpsertTfmUserFromEntraIdUserResponse => aTfmUser(),
} as const;
