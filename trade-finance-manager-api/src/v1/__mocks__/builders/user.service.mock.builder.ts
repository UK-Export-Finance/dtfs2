/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseMockBuilder } from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import {
  UpsertTfmUserFromEntraIdUserParams,
  UpsertTfmUserFromEntraIdUserResponse,
  saveUserLoginInformationParams,
  UserService,
} from '../../services/user.service';

export class UserServiceMockBuilder extends BaseMockBuilder<UserService> {
  constructor() {
    super({
      defaultInstance: {
        upsertTfmUserFromEntraIdUser({ entraIdUser, auditDetails }: UpsertTfmUserFromEntraIdUserParams): Promise<UpsertTfmUserFromEntraIdUserResponse> {
          return Promise.resolve(aTfmUser());
        },
        saveUserLoginInformation({ userId, sessionIdentifier, auditDetails }: saveUserLoginInformationParams): Promise<void> {
          return Promise.resolve();
        },
      },
    });
  }
}
