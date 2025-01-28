/* eslint-disable import/first */
import { InvalidAuditDetailsError } from '@ukef/dtfs2-common';

const mockFindOneUser = jest.fn();

import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

jest.mock('../../v1/controllers/user/get-user.controller', () => ({
  findOneUser: mockFindOneUser,
}));
const mockDeletePortalFacilityAmendment = jest.fn();

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('PortalFacilityAmendmentService', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'deletePortalFacilityAmendment').mockImplementation(mockDeletePortalFacilityAmendment);
    mockFindOneUser.mockResolvedValue(aPortalUser());
  });

  describe('deletePortalFacilityAmendment', () => {
    it('should call findOneUser with auditDetails.id', async () => {
      // Act
      await PortalFacilityAmendmentService.deletePortalFacilityAmendment({
        facilityId,
        amendmentId,
        auditDetails,
      });

      // Assert
      expect(mockFindOneUser).toHaveBeenCalledTimes(1);
      expect(mockFindOneUser).toHaveBeenCalledWith(auditDetails.id);
    });

    it('should throw InvalidAuditDetailsError if a user is not found', async () => {
      // Arrange
      mockFindOneUser.mockResolvedValue({ status: HttpStatusCode.NotFound, message: 'Invalid User Id' });

      // Act + Assert
      await expect(() =>
        PortalFacilityAmendmentService.deletePortalFacilityAmendment({
          facilityId,
          amendmentId,
          auditDetails,
        }),
      ).rejects.toThrow(InvalidAuditDetailsError);
    });

    it('should call TfmFacilitiesRepo.deletePortalFacilityAmendment with correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.deletePortalFacilityAmendment({
        facilityId,
        amendmentId,
        auditDetails,
      });

      // Assert
      expect(mockDeletePortalFacilityAmendment).toHaveBeenCalledTimes(1);
      expect(mockDeletePortalFacilityAmendment).toHaveBeenCalledWith({
        facilityId: new ObjectId(facilityId),
        amendmentId: new ObjectId(amendmentId),
        auditDetails,
      });
    });
  });
});
