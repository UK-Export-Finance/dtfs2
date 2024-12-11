import { BaseMockBuilder } from '@ukef/dtfs2-common';
import { UserSessionService } from '../../server/services/user-session.service';

export class UserSessionServiceMockBuilder extends BaseMockBuilder<UserSessionService> {
  constructor() {
    super({
      defaultInstance: {},
    });
  }
}
