/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseMockBuilder, EntraIdUser, UpsertTfmUserRequest } from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import {
  UpsertTfmUserFromEntraIdUserParams,
  UpsertTfmUserFromEntraIdUserResponse,
  saveUserLoginInformationParams,
  UserService,
} from '../../services/user.service';

export class UserServiceMockBuilder extends BaseMockBuilder<UserService> {
  constructor() {
    const userService = new UserService();
    super({
      defaultInstance: {
        /**
         *  We pass through the actual service implementation for the below method here,
         * as it is an existing pattern that we never mock synchronous methods.
         */
        transformEntraIdUserToUpsertTfmUserRequest(entraIdUser: EntraIdUser): UpsertTfmUserRequest {
          return userService.transformEntraIdUserToUpsertTfmUserRequest(entraIdUser);
        },
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
