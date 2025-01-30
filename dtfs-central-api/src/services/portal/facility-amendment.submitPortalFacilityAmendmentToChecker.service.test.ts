import { AMENDMENT_TYPES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockUpdatePortalFacilityAmendmentByAmendmentId = jest.fn();
const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const dealId = new ObjectId().toString();

const updatedAmendment = aPortalFacilityAmendment();
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'updatePortalFacilityAmendmentByAmendmentId').mockImplementation(mockUpdatePortalFacilityAmendmentByAmendmentId);
    jest.spyOn(TfmFacilitiesRepo, 'findOneAmendmentByFacilityIdAndAmendmentId').mockImplementation(mockFindOneAmendmentByFacilityIdAndAmendmentId);

    mockUpdatePortalFacilityAmendmentByAmendmentId.mockResolvedValue({});
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(updatedAmendment);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('submitPortalFacilityAmendmentToChecker', () => {
    it('should call TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({
        amendmentId,
        facilityId,
        dealId,
        auditDetails,
      });

      // Assert
      const expectedUpdate = {
        status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      };

      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledTimes(1);
      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledWith({
        update: expectedUpdate,
        facilityId: new ObjectId(facilityId),
        amendmentId: new ObjectId(amendmentId),
        auditDetails,
      });
    });
  });

  it('should call TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId with the correct params', async () => {
    // Act
    await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({
      amendmentId,
      facilityId,
      dealId,
      auditDetails,
    });

    // Assert
    expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledTimes(1);
    expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledWith(new ObjectId(facilityId), new ObjectId(amendmentId));
  });

  it('should return the result of TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
    // Act
    const expected = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({
      amendmentId,
      facilityId,
      dealId,
      auditDetails,
    });

    // Assert
    expect(expected).toEqual(updatedAmendment);
  });

  it('should throw an error if no amendment is found when calling TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
    // Arrange
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(null);

    // Act
    const returned = PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({
      amendmentId,
      facilityId,
      dealId,
      auditDetails,
    });

    // Assert
    await expect(returned).rejects.toThrow(new Error('Could not find amendment to return'));
  });

  it(`should throw an error if an amendment without a ${AMENDMENT_TYPES.PORTAL} amendment type is returned from TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId`, async () => {
    // Arrange
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce({ ...updatedAmendment, type: AMENDMENT_TYPES.TFM });

    // Act
    const returned = PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({
      amendmentId,
      facilityId,
      dealId,
      auditDetails,
    });

    // Assert
    await expect(returned).rejects.toThrow(new Error('Could not find amendment to return'));
  });
});
