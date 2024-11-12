import { AnyObject, Deal, DEAL_STATUS, DEAL_TYPE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityService } from './facility.service';

const updateBssEwcsFacilityStatusMock = jest.fn() as jest.Mock<Deal>;
const updateGefFacilityMock = jest.fn() as jest.Mock<Deal>;

jest.mock('../../v1/controllers/portal/facility/update-facility-status.controller', () => ({
  updateFacilityStatus: (params: AnyObject) => updateBssEwcsFacilityStatusMock(params),
}));

jest.mock('../../v1/controllers/portal/gef-facility/update-facility.controller', () => ({
  updateFacility: (params: AnyObject) => updateGefFacilityMock(params),
}));

const facilityId = 'facilityId';
const status = DEAL_STATUS.CANCELLED;
const auditDetails = generateSystemAuditDetails();

describe('PortalFacilityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it(`calls updateGefDealStatus when submissionType is ${DEAL_TYPE.GEF}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.GEF;

      // Act
      await PortalFacilityService.updateStatus({ facilityId, status, auditDetails, dealType });

      // Assert
      expect(updateGefFacilityMock).toHaveBeenCalledTimes(1);
      expect(updateGefFacilityMock).toHaveBeenCalledWith({
        facilityId,
        facilityUpdate: { status },
        auditDetails,
      });
      expect(updateBssEwcsFacilityStatusMock).toHaveBeenCalledTimes(0);
    });

    it(`calls updateBssEwcsDealStatus when submissionType is ${DEAL_TYPE.BSS_EWCS}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      await PortalFacilityService.updateStatus({ facilityId, status, auditDetails, dealType });

      // Assert
      expect(updateBssEwcsFacilityStatusMock).toHaveBeenCalledTimes(1);
      expect(updateBssEwcsFacilityStatusMock).toHaveBeenCalledWith({
        facilityId,
        status,
        auditDetails,
      });
      expect(updateGefFacilityMock).toHaveBeenCalledTimes(0);
    });
  });
});
