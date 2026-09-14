import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { addCheckerCommentsToApplication } from './add-checker-comments-to-application';
import { MOCK_BASIC_DEAL } from '../utils/mocks/mock-applications';
import api from '../services/api';

jest.mock('../services/api');

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };
const mockUser = aPortalSessionUser();
const dealId = '6597dffeb5ef5ff4267e5044';
const userToken = '6597dffeb5ef5ff4267e5045';
const userId = '6597dffeb5ef5ff4267e5046';
const mockComment = 'This is a test comment';

describe('addCheckerCommentsToApplication', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (api.getApplication as jest.Mock).mockResolvedValue(mockDeal);
    (api.getUserDetails as jest.Mock).mockResolvedValue(mockUser);
    (api.updateApplication as jest.Mock).mockResolvedValue(mockDeal);
  });

  describe('when a comment is NOT provided', () => {
    it('should not add a comment to the application', async () => {
      await addCheckerCommentsToApplication(dealId, userToken, userId, '');

      expect(api.getApplication).not.toHaveBeenCalled();
      expect(api.getUserDetails).not.toHaveBeenCalled();
      expect(api.updateApplication).not.toHaveBeenCalled();
    });
  });

  describe('when a comment is provided', () => {
    it('should call getApplication, getUserDetails and updateApplication with the correct variables', async () => {
      await addCheckerCommentsToApplication(dealId, userToken, userId, mockComment);

      const expectedApplication = {
        ...mockDeal,
        checkerId: userId,
        comments: [
          {
            roles: mockUser.roles,
            userName: mockUser.username,
            firstname: mockUser.firstname,
            surname: mockUser.surname,
            email: mockUser.email,
            createdAt: expect.any(Number) as number,
            comment: mockComment,
          },
        ],
      };

      expect(api.getApplication).toHaveBeenCalledTimes(1);
      expect(api.getApplication).toHaveBeenCalledWith({ dealId, userToken });

      expect(api.getUserDetails).toHaveBeenCalledTimes(1);
      expect(api.getUserDetails).toHaveBeenCalledWith({ userId, userToken });

      expect(api.updateApplication).toHaveBeenCalledTimes(1);
      expect(api.updateApplication).toHaveBeenCalledWith({ dealId, application: expectedApplication, userToken });
    });
  });
});
