/* eslint-disable import/first */
const mockFindOneUser = jest.fn();

jest.mock('../../v1/controllers/user/get-user.controller', () => ({
  findOneUser: mockFindOneUser,
}));

import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { getUnixTime } from 'date-fns';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { AMENDMENT_STATUS, AMENDMENT_TYPES, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockUpsertPortalFacilityAmendmentDraft = jest.fn();

const facilityEndDate = new Date(2030, 1, 1);

const dealId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const amendment = {
  facilityEndDate: getUnixTime(facilityEndDate),
};
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'upsertPortalFacilityAmendmentDraft').mockImplementation(mockUpsertPortalFacilityAmendmentDraft);

    mockFindOneUser.mockResolvedValue(aPortalUser());
    mockUpsertPortalFacilityAmendmentDraft.mockResolvedValue({});
  });

  describe('upsertPortalFacilityAmendmentDraft', () => {
    it('should call findOneUser with auditDetails.id', async () => {
      // Act
      await PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({
        dealId,
        facilityId,
        amendment,
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
        PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({
          dealId,
          facilityId,
          amendment,
          auditDetails,
        }),
      ).rejects.toThrow(InvalidAuditDetailsError);
    });

    it('should call TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft with correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({
        dealId,
        facilityId,
        amendment,
        auditDetails,
      });

      // Assert
      const expectedAmendment = {
        ...amendment,
        dealId: new ObjectId(dealId),
        facilityId: new ObjectId(facilityId),
        amendmentId: expect.any(ObjectId) as ObjectId,
        type: AMENDMENT_TYPES.PORTAL,
        status: AMENDMENT_STATUS.IN_PROGRESS,
        createdAt: getUnixTime(new Date()),
        updatedAt: getUnixTime(new Date()),
        createdBy: {
          username: aPortalUser().username,
          name: `${aPortalUser().firstname} ${aPortalUser().surname}`,
          email: aPortalUser().email,
        },
        facilityEndDate,
      };

      expect(mockUpsertPortalFacilityAmendmentDraft).toHaveBeenCalledTimes(1);
      expect(mockUpsertPortalFacilityAmendmentDraft).toHaveBeenCalledWith(expectedAmendment, auditDetails);
    });

    it('should return the new amendment', async () => {
      // Act
      const response = await PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({
        dealId,
        facilityId,
        amendment,
        auditDetails,
      });

      // Assert
      const expectedAmendment = {
        ...amendment,
        dealId: new ObjectId(dealId),
        facilityId: new ObjectId(facilityId),
        amendmentId: expect.any(ObjectId) as ObjectId,
        type: AMENDMENT_TYPES.PORTAL,
        status: AMENDMENT_STATUS.IN_PROGRESS,
        createdAt: getUnixTime(new Date()),
        updatedAt: getUnixTime(new Date()),
        createdBy: {
          username: aPortalUser().username,
          name: `${aPortalUser().firstname} ${aPortalUser().surname}`,
          email: aPortalUser().email,
        },
        facilityEndDate,
      };

      expect(response).toEqual(expectedAmendment);
    });
  });
});
