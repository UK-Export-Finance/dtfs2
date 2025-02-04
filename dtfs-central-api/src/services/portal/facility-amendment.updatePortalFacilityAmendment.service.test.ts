/* eslint-disable import/first */
import { AMENDMENT_TYPES } from '@ukef/dtfs2-common';

const mockFindOneUser = jest.fn();

jest.mock('../../v1/controllers/user/get-user.controller', () => ({
  findOneUser: mockFindOneUser,
}));

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
  changeCoverStartDate: true,
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
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

    mockFindOneUser.mockResolvedValue(aPortalUser());
    mockUpdatePortalFacilityAmendmentByAmendmentId.mockResolvedValue({});
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(updatedAmendment);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('updatePortalFacilityAmendment', () => {
    it('should call TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.updatePortalFacilityAmendment({
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
      });
    });
  });

  it('should call TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId with the correct params', async () => {
    // Act
    await PortalFacilityAmendmentService.updatePortalFacilityAmendment({
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
    const expected = await PortalFacilityAmendmentService.updatePortalFacilityAmendment({
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
    const returned = PortalFacilityAmendmentService.updatePortalFacilityAmendment({
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
    const returned = PortalFacilityAmendmentService.updatePortalFacilityAmendment({
      amendmentId,
      facilityId,
      update,
      auditDetails,
    });

    // Assert
    await expect(returned).rejects.toThrow(new Error('Could not find amendment to return'));
  });
});
