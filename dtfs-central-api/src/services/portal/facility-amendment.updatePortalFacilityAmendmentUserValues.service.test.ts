import { AMENDMENT_TYPES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockUpdatePortalFacilityAmendmentByAmendmentId = jest.fn();
const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const update = {
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
  bankReviewDate: null,
  changeCoverEndDate: true,
};
const updatedAmendment = { ...aPortalFacilityAmendment(), ...update };
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

  describe('updatePortalFacilityAmendment', () => {
    it('should call TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.updatePortalFacilityAmendmentUserValues({
        amendmentId,
        facilityId,
        update,
        auditDetails,
      });

      // Assert
      const expectedUpdate = {
        ...update,
        updatedAt: getUnixTime(new Date()),
      };

      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledTimes(1);
      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledWith({
        update: expectedUpdate,
        facilityId: new ObjectId(facilityId),
        amendmentId: new ObjectId(amendmentId),
        auditDetails,
        allowedStatuses: [PORTAL_AMENDMENT_STATUS.DRAFT],
      });
    });
  });

  it('should call TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId with the correct params', async () => {
    // Act
    await PortalFacilityAmendmentService.updatePortalFacilityAmendmentUserValues({
      amendmentId,
      facilityId,
      update,
      auditDetails,
    });

    // Assert
    expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledTimes(1);
    expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledWith(new ObjectId(facilityId), new ObjectId(amendmentId));
  });

  it('should return the result of TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
    // Act
    const expected = await PortalFacilityAmendmentService.updatePortalFacilityAmendmentUserValues({
      amendmentId,
      facilityId,
      update,
      auditDetails,
    });

    // Assert
    expect(expected).toEqual(updatedAmendment);
  });

  it('should throw an error if no amendment is found when calling TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
    // Arrange
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(null);

    // Act
    const returned = PortalFacilityAmendmentService.updatePortalFacilityAmendmentUserValues({
      amendmentId,
      facilityId,
      update,
      auditDetails,
    });

    // Assert
    await expect(returned).rejects.toThrow(new Error('Could not find amendment to return'));
  });

  it(`should throw an error if an amendment without a ${AMENDMENT_TYPES.PORTAL} amendment type is returned from TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId`, async () => {
    // Arrange
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce({ ...updatedAmendment, type: AMENDMENT_TYPES.TFM });

    // Act
    const returned = PortalFacilityAmendmentService.updatePortalFacilityAmendmentUserValues({
      amendmentId,
      facilityId,
      update,
      auditDetails,
    });

    // Assert
    await expect(returned).rejects.toThrow(new Error('Could not find amendment to return'));
  });
});
