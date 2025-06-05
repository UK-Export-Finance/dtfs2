import { AMENDMENT_TYPES, AmendmentNotFoundError, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockUpdatePortalFacilityAmendmentByAmendmentId = jest.fn();
const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();
const mockValidateNoOtherAmendmentInProgressOnFacility = jest.fn();
const mockValidateAmendmentIsComplete = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const updatedAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'updatePortalFacilityAmendmentByAmendmentId').mockImplementation(mockUpdatePortalFacilityAmendmentByAmendmentId);
    jest.spyOn(TfmFacilitiesRepo, 'findOneAmendmentByFacilityIdAndAmendmentId').mockImplementation(mockFindOneAmendmentByFacilityIdAndAmendmentId);

    jest
      .spyOn(PortalFacilityAmendmentService, 'validateNoOtherAmendmentInProgressOnFacility')
      .mockImplementation(mockValidateNoOtherAmendmentInProgressOnFacility);
    jest.spyOn(PortalFacilityAmendmentService, 'validateAmendmentIsComplete').mockImplementation(mockValidateAmendmentIsComplete);

    mockUpdatePortalFacilityAmendmentByAmendmentId.mockResolvedValue({});
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(updatedAmendment);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('returnPortalFacilityAmendmentToMaker', () => {
    it('should call PortalFacilityAmendmentService.validateAmendmentIsComplete', async () => {
      // Act
      await PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      expect(mockValidateAmendmentIsComplete).toHaveBeenCalledTimes(1);
      expect(mockValidateAmendmentIsComplete).toHaveBeenCalledWith({
        facilityId,
        amendmentId,
      });
    });

    it('should call PortalFacilityAmendmentService.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
      // Act
      await PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledTimes(2);
      expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledWith(facilityId, amendmentId);
    });

    it('should throw an AmendmentNotFoundError if no amendment is found when calling TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
      // Arrange
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(null);

      // Act
      const returned = PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      await expect(returned).rejects.toThrow(new AmendmentNotFoundError(amendmentId, facilityId));
    });

    it(`should throw an AmendmentNotFoundError if an amendment without a ${AMENDMENT_TYPES.PORTAL} amendment type is returned from TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId`, async () => {
      // Arrange
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce({ ...updatedAmendment, type: AMENDMENT_TYPES.TFM });

      // Act
      const returned = PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      await expect(returned).rejects.toThrow(new AmendmentNotFoundError(amendmentId, facilityId));
    });

    it('should call PortalFacilityAmendmentService.validateNoOtherAmendmentsUnderWayOnFacility', async () => {
      // Arrange
      const existingAmendment = aPortalFacilityAmendment();
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(existingAmendment);

      // Act
      await PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      expect(mockValidateNoOtherAmendmentInProgressOnFacility).toHaveBeenCalledTimes(1);
      expect(mockValidateNoOtherAmendmentInProgressOnFacility).toHaveBeenCalledWith({
        facilityId,
        amendmentId,
      });
    });

    it('should call TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      const expectedUpdate = {
        status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
      };

      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledTimes(1);
      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledWith({
        update: expectedUpdate,
        facilityId: new ObjectId(facilityId),
        amendmentId: new ObjectId(amendmentId),
        auditDetails,
        allowedStatuses: [PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL],
      });
    });

    it('should return the result of TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
      // Act
      const expected = await PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({
        amendmentId,
        facilityId,
        auditDetails,
      });

      // Assert
      expect(expected).toEqual(updatedAmendment);
    });
  });
});
