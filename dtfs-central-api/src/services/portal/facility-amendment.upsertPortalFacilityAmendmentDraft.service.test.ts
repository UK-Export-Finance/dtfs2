/* eslint-disable import/first */
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES, InvalidAuditDetailsError, AmendmentsEligibilityCriteria } from '@ukef/dtfs2-common';

const mockFindOneUser = jest.fn();
const mockFindOneFacility = jest.fn();
const mockFindLatestEligibilityCriteria = jest.fn() as jest.Mock<Promise<AmendmentsEligibilityCriteria>>;

import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { getUnixTime } from 'date-fns';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { amendmentsEligibilityCriteria } from '../../../test-helpers/test-data/eligibility-criteria-amendments';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aFacility, aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

jest.mock('../../v1/controllers/user/get-user.controller', () => ({
  findOneUser: mockFindOneUser,
}));

jest.mock('../../v1/controllers/portal/facility/get-facility.controller', () => ({
  findOneFacility: mockFindOneFacility,
}));

jest.mock('../../repositories/portal/eligibility-criteria-amendments.repo', () => ({
  EligibilityCriteriaAmendmentsRepo: {
    findLatestEligibilityCriteria: (facilityType: string) => mockFindLatestEligibilityCriteria(facilityType),
  },
}));

const mockUpsertPortalFacilityAmendmentDraft = jest.fn();

const dealId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const amendment = aPortalFacilityAmendmentUserValues();
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);
const facility = aFacility();
const eligibilityCriteria = amendmentsEligibilityCriteria();

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'upsertPortalFacilityAmendmentDraft').mockImplementation(mockUpsertPortalFacilityAmendmentDraft);

    mockFindOneUser.mockResolvedValue(aPortalUser());
    mockFindOneFacility.mockResolvedValue(facility);
    mockFindOneFacility.mockResolvedValue(facility);
    mockFindLatestEligibilityCriteria.mockResolvedValue(eligibilityCriteria);
  });

  afterAll(() => {
    jest.useRealTimers();
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

    it('should call findOneFacility with the facility id', async () => {
      // Act
      await PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({
        dealId,
        facilityId,
        amendment,
        auditDetails,
      });

      // Assert
      expect(mockFindOneFacility).toHaveBeenCalledTimes(1);
      expect(mockFindOneFacility).toHaveBeenCalledWith(facilityId);
    });

    it('should call findLatestEligibilityCriteria with the facility type', async () => {
      // Act
      await PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({
        dealId,
        facilityId,
        amendment,
        auditDetails,
      });

      // Assert
      expect(mockFindLatestEligibilityCriteria).toHaveBeenCalledTimes(1);
      expect(mockFindLatestEligibilityCriteria).toHaveBeenCalledWith(facility.type);
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
        status: PORTAL_AMENDMENT_STATUS.DRAFT,
        createdAt: getUnixTime(new Date()),
        updatedAt: getUnixTime(new Date()),
        eligibilityCriteria: {
          version: eligibilityCriteria.version,
          criteria: [
            { ...eligibilityCriteria.criteria[0], answer: null },
            { ...eligibilityCriteria.criteria[1], answer: null },
          ],
        },
        createdBy: {
          username: aPortalUser().username,
          name: `${aPortalUser().firstname} ${aPortalUser().surname}`,
          email: aPortalUser().email,
        },
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
        status: PORTAL_AMENDMENT_STATUS.DRAFT,
        createdAt: getUnixTime(new Date()),
        updatedAt: getUnixTime(new Date()),
        eligibilityCriteria: {
          version: eligibilityCriteria.version,
          criteria: [
            { ...eligibilityCriteria.criteria[0], answer: null },
            { ...eligibilityCriteria.criteria[1], answer: null },
          ],
        },
        createdBy: {
          username: aPortalUser().username,
          name: `${aPortalUser().firstname} ${aPortalUser().surname}`,
          email: aPortalUser().email,
        },
      };

      expect(response).toEqual(expectedAmendment);
    });
  });
});
