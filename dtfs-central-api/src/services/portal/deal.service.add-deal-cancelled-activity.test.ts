import { Activity, AnyObject, Deal, DEAL_TYPE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalDealService } from './deal.service';

const addGefDealCancelledActivityMock = jest.fn() as jest.Mock<Deal>;

jest.mock('../../v1/controllers/portal/gef-deal/add-gef-deal-cancelled-activity.controller', () => ({
  addGefDealCancelledActivity: (params: AnyObject) => addGefDealCancelledActivityMock(params),
}));

const dealId = 'dealId';
const portalActivities: Array<Activity> = [];
const author = {
  firstName: 'First name',
  lastName: 'Last name',
  _id: '1',
};

const auditDetails = generateSystemAuditDetails();

describe('PortalDealService - addDealCancelledActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`calls addGefDealCancelledActivity when dealType is ${DEAL_TYPE.GEF}`, async () => {
    // Arrange
    const dealType = DEAL_TYPE.GEF;

    // Act
    await PortalDealService.addDealCancelledActivity({ dealId, dealType, portalActivities, author, auditDetails });

    // Assert
    expect(addGefDealCancelledActivityMock).toHaveBeenCalledTimes(1);

    expect(addGefDealCancelledActivityMock).toHaveBeenCalledWith({
      dealId,
      portalActivities,
      author,
      auditDetails,
    });
  });

  it(`does not call addGefDealCancelledActivity when dealType is not ${DEAL_TYPE.GEF}`, async () => {
    // Arrange
    const dealType = DEAL_TYPE.BSS_EWCS;

    // Act + Assert
    await expect(PortalDealService.addDealCancelledActivity({ dealId, dealType, portalActivities, author, auditDetails })).rejects.toThrow();

    // Assert
    expect(addGefDealCancelledActivityMock).toHaveBeenCalledTimes(0);
  });
});
