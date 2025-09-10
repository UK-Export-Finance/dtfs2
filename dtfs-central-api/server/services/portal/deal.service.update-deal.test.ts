import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { AnyObject, Deal, DEAL_STATUS, DEAL_TYPE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalDealService } from './deal.service';

const updateBssEwcsDealMock = jest.fn() as jest.Mock<Deal>;
const updateGefDealMock = jest.fn() as jest.Mock<Deal>;

jest.mock('../../v1/controllers/portal/deal/update-deal.controller', () => ({
  updateBssEwcsDeal: (params: AnyObject) => updateBssEwcsDealMock(params),
}));

jest.mock('../../v1/controllers/portal/gef-deal/update-deal.controller', () => ({
  updateGefDeal: (params: AnyObject) => updateGefDealMock(params),
}));

const dealId = 'dealId';
const dealUpdate = {};
const auditDetails = generateSystemAuditDetails();
const existingDeal = {
  dealType: DEAL_TYPE.GEF,
  status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
  updatedAt: 1234.0,
} as unknown as Deal;
const routePath = '/portal/deal/update-deal';
const mockUser = aPortalSessionUser();

describe('PortalDealService - updateDeal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should call updateGefDeal when dealType is ${DEAL_TYPE.GEF}`, async () => {
    // Arrange
    const dealType = DEAL_TYPE.GEF;

    // Act
    await PortalDealService.updateDeal({ dealId, dealUpdate, auditDetails, dealType });

    // Assert
    expect(updateGefDealMock).toHaveBeenCalledTimes(1);

    expect(updateGefDealMock).toHaveBeenCalledWith({
      dealId,
      dealUpdate,
      auditDetails,
    });

    expect(updateBssEwcsDealMock).toHaveBeenCalledTimes(0);
  });

  it(`should call updateBssEwcsDeal when dealType is ${DEAL_TYPE.BSS_EWCS}`, async () => {
    // Arrange
    const dealType = DEAL_TYPE.BSS_EWCS;

    // Act
    await PortalDealService.updateDeal({ dealId, dealUpdate, user: mockUser, auditDetails, existingDeal, routePath, dealType });

    // Assert
    expect(updateBssEwcsDealMock).toHaveBeenCalledTimes(1);

    expect(updateBssEwcsDealMock).toHaveBeenCalledWith({
      dealId,
      dealUpdate,
      user: mockUser,
      auditDetails,
      existingDeal,
      routePath,
    });

    expect(updateGefDealMock).toHaveBeenCalledTimes(0);
  });
});
