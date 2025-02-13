import { BaseMockBuilder } from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { UpsertTfmUserFromEntraIdUserResponse, UserService } from '../../services/user.service';

export class UserServiceMockBuilder extends BaseMockBuilder<UserService> {
  constructor() {
    super({
      defaultInstance: {
        upsertTfmUserFromEntraIdUser(): Promise<UpsertTfmUserFromEntraIdUserResponse> {
          return Promise.resolve(aTfmUser());
        },
        saveUserLoginInformation(): Promise<void> {
          return Promise.resolve();
        },
      },
    });
  }
}
