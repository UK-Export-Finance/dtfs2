import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';

// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getUserDetailsMock = jest.fn();
const updateApplicationMock = jest.fn();

import { DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { addCheckerCommentsToApplication } from './add-checker-comments-to-application';
import { MOCK_BASIC_DEAL } from '../utils/mocks/mock-applications';
import api from '../services/api';

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };
const mockUser = aPortalSessionUser();

const dealId = '6597dffeb5ef5ff4267e5044';
const userToken = '6597dffeb5ef5ff4267e5045';
const userId = '6597dffeb5ef5ff4267e5046';
const mockComment = 'This is a test comment';

jest.mock('../services/api', () => ({
  getApplication: getApplicationMock,
  getUserDetails: getUserDetailsMock,
  updateApplication: updateApplicationMock,
}));

describe('addCheckerCommentsToApplication', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(api, 'getApplication').mockImplementation(getApplicationMock);
    jest.spyOn(api, 'getUserDetails').mockImplementation(getUserDetailsMock);
    jest.spyOn(api, 'updateApplication').mockImplementation(updateApplicationMock);

    getApplicationMock.mockResolvedValue(mockDeal);
    getUserDetailsMock.mockResolvedValue(mockUser);
    updateApplicationMock.mockResolvedValue(mockDeal);
  });

  describe('when a comment is NOT provided', () => {
    it('should not add a comment to the application', async () => {
      await addCheckerCommentsToApplication(dealId, userToken, userId, '');

      expect(getApplicationMock).not.toHaveBeenCalled();
      expect(getUserDetailsMock).not.toHaveBeenCalled();
      expect(updateApplicationMock).not.toHaveBeenCalled();
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

      expect(getApplicationMock).toHaveBeenCalledTimes(1);
      expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken });

      expect(getUserDetailsMock).toHaveBeenCalledTimes(1);
      expect(getUserDetailsMock).toHaveBeenCalledWith({ userId, userToken });

      expect(updateApplicationMock).toHaveBeenCalledTimes(1);
      expect(updateApplicationMock).toHaveBeenCalledWith({ dealId, application: expectedApplication, userToken });
    });
  });
});
