import { DEAL_TYPE, PORTAL_ACTIVITY_LABEL, UKEF } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { PortalDealService } from './deal.service';
import { PortalActivityRepo } from '../../repositories/portal/portal-activity.repo';

const addPortalActivityMock = jest.fn();

const dealId = new ObjectId();

const author = {
  firstName: 'First name',
  lastName: 'Last name',
  _id: '1',
};

const auditDetails = generateSystemAuditDetails();

describe('PortalDealService - addGefDealCancellationPendingActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`when dealType is ${DEAL_TYPE.GEF}`, () => {
    beforeEach(() => {
      jest.spyOn(PortalActivityRepo, 'addPortalActivity').mockImplementation(addPortalActivityMock);
    });

    it('should call addPortalActivity with the correct params', async () => {
      // Act
      await PortalDealService.addGefDealCancellationPendingActivity({
        dealId,
        dealType: DEAL_TYPE.GEF,
        author,
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

  describe(`when dealType is not ${DEAL_TYPE.GEF}`, () => {
    it('should not call addPortalActivity', async () => {
      // Act
      await PortalDealService.addGefDealCancellationPendingActivity({
        dealId,
        dealType: DEAL_TYPE.BSS_EWCS,
        author,
        auditDetails,
      });

      // Assert
      expect(addPortalActivityMock).toHaveBeenCalledTimes(0);
    });
  });
});
