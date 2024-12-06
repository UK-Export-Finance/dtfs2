import { DEAL_TYPE, GefDeal, PortalActivity, PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE, TfmDeal, UKEF } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { PortalDealService } from './deal.service';
import { PortalActivityRepo } from '../../repositories/portal/portal-activity.repo';

const addPortalActivityMock = jest.fn();

const dealId = new ObjectId();

const portalActivities: PortalActivity[] = [];

const dealSnapshot = {
  _id: dealId,
  portalActivities,
} as GefDeal;

const deal = {
  _id: dealId,
  dealSnapshot,
  tfm: {
    cancellation: {},
  },
} as TfmDeal;

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
    it('should call addPortalActivity', async () => {
      // Arrange
      addPortalActivityMock.mockResolvedValue({ matchedCount: 1 });

      jest.spyOn(PortalActivityRepo, 'addPortalActivity').mockImplementation(addPortalActivityMock);

      const mockDeal = deal;
      mockDeal.dealSnapshot.dealType = DEAL_TYPE.GEF;

      // Act
      await PortalDealService.addGefDealCancelledActivity({ deal: mockDeal, author, auditDetails });

      // Assert
      expect(addPortalActivityMock).toHaveBeenCalledTimes(1);

      const expectedActivity = {
        type: PORTAL_ACTIVITY_TYPE.DEAL_CANCELLED,
        timestamp: getUnixTime(new Date()),
        author: {
          _id: author._id,
          firstName: UKEF.ACRONYM,
        },
        label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
        html: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
      };

      expect(addPortalActivityMock).toHaveBeenCalledWith(dealId, expectedActivity, auditDetails);
    });
  });

  describe(`when dealType is not ${DEAL_TYPE.GEF}`, () => {
    it(`should not call addPortalActivity when dealType is not ${DEAL_TYPE.GEF}`, async () => {
      // Arrange
      const mockDeal = deal;
      mockDeal.dealSnapshot.dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      await PortalDealService.addGefDealCancelledActivity({ deal: mockDeal, author, auditDetails });

      // Assert
      expect(addPortalActivityMock).toHaveBeenCalledTimes(0);
    });
  });
});
