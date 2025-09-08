import { DEAL_TYPE, PORTAL_ACTIVITY_LABEL, UKEF, now, getLongDateFormat } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { PortalDealService } from './deal.service';
import { PortalActivityRepo } from '../../repositories/portal/portal-activity.repo';

const addPortalActivityMock = jest.fn();

const dealId = new ObjectId();
const effectiveFrom = now();
const author = {
  firstName: 'First name',
  lastName: 'Last name',
  _id: '1',
};
const auditDetails = generateSystemAuditDetails();
const expectedActivity = {
  label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED,
  text: `Date effective from: ${getLongDateFormat(effectiveFrom)}`,
  scheduledCancellation: true,
  timestamp: getUnixTime(now()),
  author: {
    _id: author._id,
    firstName: UKEF.ACRONYM,
  },
};

describe('addGefDealCancellationPendingActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`when deal type is ${DEAL_TYPE.GEF}`, () => {
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
        effectiveFrom,
      });

      // Assert
      expect(addPortalActivityMock).toHaveBeenCalledTimes(1);
      expect(addPortalActivityMock).toHaveBeenCalledWith(dealId, expectedActivity, auditDetails);
    });
  });

  describe(`when deal type is not ${DEAL_TYPE.GEF}`, () => {
    it('should not call addPortalActivity', async () => {
      // Act
      await PortalDealService.addGefDealCancellationPendingActivity({
        dealId,
        dealType: DEAL_TYPE.BSS_EWCS,
        author,
        auditDetails,
        effectiveFrom,
      });

      // Assert
      expect(addPortalActivityMock).toHaveBeenCalledTimes(0);
    });
  });
});
