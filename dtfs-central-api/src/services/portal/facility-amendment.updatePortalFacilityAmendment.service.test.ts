/* eslint-disable import/first */
const mockFindOneUser = jest.fn();

jest.mock('../../v1/controllers/user/get-user.controller', () => ({
  findOneUser: mockFindOneUser,
}));

import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockUpdatePortalFacilityAmendmentByAmendmentId = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const update = {
  changeCoverStartDate: true,
  isUsingFacilityEndDate: true,
  facilityEndDate: new Date(),
};
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'updatePortalFacilityAmendmentByAmendmentId').mockImplementation(mockUpdatePortalFacilityAmendmentByAmendmentId);

    mockFindOneUser.mockResolvedValue(aPortalUser());
    mockUpdatePortalFacilityAmendmentByAmendmentId.mockResolvedValue({});
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('updatePortalFacilityAmendment', () => {
    it('should call TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId with correct params', async () => {
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
      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledWith({ update: expectedUpdate, facilityId, amendmentId, auditDetails });
    });
  });
});
