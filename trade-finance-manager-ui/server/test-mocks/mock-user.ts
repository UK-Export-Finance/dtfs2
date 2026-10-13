import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';
import { TEAM_IDS } from '@ukef/dtfs2-common';

export const mockUser = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: [TEAM_IDS.PIM],
  email: MOCK_EMAIL,
};
