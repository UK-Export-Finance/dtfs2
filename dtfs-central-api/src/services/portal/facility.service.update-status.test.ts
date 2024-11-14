import { DEAL_STATUS, DEAL_TYPE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityService } from './facility.service';
import { PortalBssEwcsFacilityRepo } from '../../repositories/portal/bss-ewcs-facilities.repo';
import { PortalGefFacilityRepo } from '../../repositories/portal/gef-facilities.repo';

const dealId = 'dealId';
const status = DEAL_STATUS.CANCELLED;
const auditDetails = generateSystemAuditDetails();

const updateGefFacilityMock = jest.fn();
const updateBssEwcsFacilityStatusMock = jest.fn();

describe('PortalFacilityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(PortalBssEwcsFacilityRepo, 'updateStatusByDealId').mockImplementation(updateBssEwcsFacilityStatusMock);
    jest.spyOn(PortalGefFacilityRepo, 'updateByDealId').mockImplementation(updateGefFacilityMock);
  });

  describe('updateStatus', () => {
    it(`calls PortalGefFacilityRepo.updateByDealId when submissionType is ${DEAL_TYPE.GEF}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.GEF;

      // Act
      await PortalFacilityService.updateStatusByDealId({ dealId, status, auditDetails, dealType });

      // Assert
      expect(updateGefFacilityMock).toHaveBeenCalledTimes(1);
      expect(updateGefFacilityMock).toHaveBeenCalledWith(dealId, { status }, auditDetails);
      expect(updateBssEwcsFacilityStatusMock).toHaveBeenCalledTimes(0);
    });

    it(`calls PortalBssEwcsFacilityRepo.updateStatusByDealId when submissionType is ${DEAL_TYPE.BSS_EWCS}`, async () => {
      // Arrange
      const dealType = DEAL_TYPE.BSS_EWCS;

      // Act
      await PortalFacilityService.updateStatusByDealId({ dealId, status, auditDetails, dealType });

      // Assert
      expect(updateBssEwcsFacilityStatusMock).toHaveBeenCalledTimes(1);
      expect(updateBssEwcsFacilityStatusMock).toHaveBeenCalledWith(dealId, status, auditDetails);
      expect(updateGefFacilityMock).toHaveBeenCalledTimes(0);
    });
  });
});
