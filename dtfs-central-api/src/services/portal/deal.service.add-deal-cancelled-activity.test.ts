import { DEAL_TYPE, GefDeal, PortalActivity, PORTAL_ACTIVITY_LABEL, TfmDeal, UKEF } from '@ukef/dtfs2-common';
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

const authorWithNoId = {
  firstName: 'First name',
  lastName: 'Last name',
};

const author = {
  ...authorWithNoId,
  _id: '1',
};

const auditDetails = generateSystemAuditDetails();

describe('PortalDealService - addGefDealCancelledActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`when dealType is ${DEAL_TYPE.GEF}`, () => {
    beforeEach(() => {
      jest.spyOn(PortalActivityRepo, 'addPortalActivity').mockImplementation(addPortalActivityMock);
    });

    const mockDeal = deal;
    mockDeal.dealSnapshot.dealType = DEAL_TYPE.GEF;

    describe('when cancellationIsInFuture is false', () => {
      it('should call addPortalActivity with the correct params', async () => {
        // Act
        await PortalDealService.addGefDealCancelledActivity({
          deal: mockDeal,
          author,
          cancellationIsInFuture: false,
          auditDetails,
        });

        // Assert
        expect(addPortalActivityMock).toHaveBeenCalledTimes(1);

        const expectedActivity = {
          label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
          timestamp: getUnixTime(new Date()),
          author: {
            _id: author._id,
            firstName: UKEF.ACRONYM,
          },
        };

        expect(addPortalActivityMock).toHaveBeenCalledWith(dealId, expectedActivity, auditDetails);
      });
    });

    describe('when cancellationIsInFuture is true', () => {
      it('should call addPortalActivity with the correct params', async () => {
        // Act
        await PortalDealService.addGefDealCancelledActivity({
          deal: mockDeal,
          author,
          cancellationIsInFuture: true,
          auditDetails,
        });

        // Assert
        expect(addPortalActivityMock).toHaveBeenCalledTimes(1);

        const expectedActivity = {
          label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_PENDING,
          timestamp: getUnixTime(new Date()),
          author: {
            _id: author._id,
            firstName: UKEF.ACRONYM,
          },
        };

        expect(addPortalActivityMock).toHaveBeenCalledWith(dealId, expectedActivity, auditDetails);
      });
    });

    describe('when the provided author does not have an ID', () => {
      it('should call addPortalActivity with an undefined author._id string', async () => {
        // Act
        await PortalDealService.addGefDealCancelledActivity({
          deal: mockDeal,
          author: authorWithNoId,
          cancellationIsInFuture: false,
          auditDetails,
        });

        // Assert
        expect(addPortalActivityMock).toHaveBeenCalledTimes(1);

        const expectedActivity = {
          label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
          timestamp: getUnixTime(new Date()),
          author: {
            _id: undefined,
            firstName: UKEF.ACRONYM,
          },
        };

        expect(addPortalActivityMock).toHaveBeenCalledWith(dealId, expectedActivity, auditDetails);
      });
    });
  });

  describe(`when dealType is not ${DEAL_TYPE.GEF}`, () => {
    it('should not call addPortalActivity', async () => {
      // Arrange
      const mockDeal = deal;
      mockDeal.dealSnapshot.dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      await PortalDealService.addGefDealCancelledActivity({
        deal: mockDeal,
        author,
        cancellationIsInFuture: false,
        auditDetails,
      });

      // Assert
      expect(addPortalActivityMock).toHaveBeenCalledTimes(0);
    });
  });
});
