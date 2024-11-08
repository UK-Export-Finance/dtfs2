import { AnyObject, Deal, DEAL_STATUS, DEAL_TYPE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalDealService } from './deal.service';

const updateBssEwcsDealStatusMock = jest.fn() as jest.Mock<Deal>;
const updateGefDealStatusMock = jest.fn() as jest.Mock<Deal>;

jest.mock('../../v1/controllers/portal/deal/update-deal-status.controller', () => ({
  updateBssEwcsDealStatus: (params: AnyObject) => updateBssEwcsDealStatusMock(params),
}));

jest.mock('../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller', () => ({
  updateGefDealStatus: (params: AnyObject) => updateGefDealStatusMock(params),
}));

const dealId = 'dealId';
const status = DEAL_STATUS.CANCELLED;
const auditDetails = generateSystemAuditDetails();

describe('PortalDealService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it(`calls updateGefDealStatus when submissionType is ${DEAL_TYPE.GEF}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.GEF;

      // Act
      await PortalDealService.updateStatus({ dealId, status, auditDetails, dealType });

      // Assert
      expect(updateGefDealStatusMock).toHaveBeenCalledTimes(1);
      expect(updateGefDealStatusMock).toHaveBeenCalledWith({
        dealId,
        status,
        auditDetails,
      });
      expect(updateBssEwcsDealStatusMock).toHaveBeenCalledTimes(0);
    });

    it(`calls updateGefDealStatus when submissionType is ${DEAL_TYPE.BSS_EWCS}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      await PortalDealService.updateStatus({ dealId, status, auditDetails, dealType });

      // Assert
      expect(updateBssEwcsDealStatusMock).toHaveBeenCalledTimes(1);
      expect(updateBssEwcsDealStatusMock).toHaveBeenCalledWith({
        dealId,
        status,
        auditDetails,
      });
      expect(updateGefDealStatusMock).toHaveBeenCalledTimes(0);
    });
  });
});
