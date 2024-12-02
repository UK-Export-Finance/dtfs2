import { Activity, AnyObject, Deal, DEAL_TYPE, PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { getUnixTime } from 'date-fns';
import { PortalDealService } from './deal.service';

const updateDealMock = jest.fn() as jest.Mock<Deal>;

jest.mock('../../v1/controllers/portal/gef-deal/update-deal', () => ({
  updateDeal: (params: AnyObject) => updateDealMock(params),
}));

const dealId = 'dealId';

const portalActivities: Array<Activity> = [];

const author = {
  firstName: 'First name',
  lastName: 'Last name',
  _id: '1',
};

const auditDetails = generateSystemAuditDetails();

describe('PortalDealService - addGefDealCancelledActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`when dealType is ${DEAL_TYPE.GEF}`, () => {
    it('should call updateDeal', async () => {
      // Arrange
      const dealType = DEAL_TYPE.GEF;

      // Act
      await PortalDealService.addGefDealCancelledActivity({ dealId, dealType, portalActivities, author, auditDetails });

      // Assert
      expect(updateDealMock).toHaveBeenCalledTimes(1);

      const expectedActivity = {
        type: PORTAL_ACTIVITY_TYPE.DEAL_CANCELLED,
        timestamp: getUnixTime(new Date()),
        author: {
          _id: author._id,
          firstName: 'UKEF',
        },
        label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
      };

      const dealUpdate = {
        portalActivities: [expectedActivity, ...portalActivities],
      };

      expect(updateDealMock).toHaveBeenCalledWith({
        dealId,
        dealUpdate,
        auditDetails,
      });
    });
  });

  describe(`when dealType is not ${DEAL_TYPE.GEF}`, () => {
    it(`does not call updateDeal when dealType is not ${DEAL_TYPE.GEF}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      await PortalDealService.addGefDealCancelledActivity({ dealId, dealType, portalActivities, author, auditDetails });

      // Assert
      expect(updateDealMock).toHaveBeenCalledTimes(0);
    });
  });
});
