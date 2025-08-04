import { ACTIVITY_TYPES, AMENDMENT_TYPES, AmendmentNotFoundError, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { aPortalUser } from '../../../test-helpers';
import { TfmActivitiesRepo } from '../../repositories/tfm-deals-repo';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockUpdatePortalFacilityAmendmentByAmendmentId = jest.fn();
const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();
const mockValidateNoOtherAmendmentInProgressOnFacility = jest.fn();
const mockValidateAmendmentIsComplete = jest.fn();
const mockAddTfmActivity = jest.fn();
console.error = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();
const referenceNumber = `${facilityId}-001`;

const updatedAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, referenceNumber });
const auditDetails = generatePortalAuditDetails(aPortalUser()._id);

const mockTfm = {
  tfm: {
    submissionDetails: {
      exporterPartyUrn: '12345',
    },
  },
};

const bankId = '1';
const bankName = 'test bank';

const requestDate = getUnixTime(new Date());

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'updatePortalFacilityAmendmentByAmendmentId').mockImplementation(mockUpdatePortalFacilityAmendmentByAmendmentId);
    jest.spyOn(TfmFacilitiesRepo, 'findOneAmendmentByFacilityIdAndAmendmentId').mockImplementation(mockFindOneAmendmentByFacilityIdAndAmendmentId);
    jest.spyOn(TfmActivitiesRepo, 'submitTfmActivity').mockImplementation(mockAddTfmActivity);

    jest
      .spyOn(PortalFacilityAmendmentService, 'validateNoOtherAmendmentInProgressOnFacility')
      .mockImplementation(mockValidateNoOtherAmendmentInProgressOnFacility);
    jest.spyOn(PortalFacilityAmendmentService, 'validateAmendmentIsComplete').mockImplementation(mockValidateAmendmentIsComplete);

    mockUpdatePortalFacilityAmendmentByAmendmentId.mockResolvedValue({});
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(updatedAmendment);
    mockAddTfmActivity.mockResolvedValue({ deal: mockTfm });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('submitPortalFacilityAmendmentToUkef', () => {
    it('should call PortalFacilityAmendmentService.validateAmendmentIsComplete', async () => {
      // Act
      await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
        amendmentId,
        facilityId,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails,
        bankId,
        bankName,
        requestDate,
      });

      // Assert
      expect(mockValidateAmendmentIsComplete).toHaveBeenCalledTimes(1);
      expect(mockValidateAmendmentIsComplete).toHaveBeenCalledWith({
        facilityId,
        amendmentId,
      });
    });

    it('should call PortalFacilityAmendmentService.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
      // Arrange
      const anotherFacilityId = new ObjectId().toString();
      const anotherAmendmentId = new ObjectId().toString();

      // Act
      await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
        amendmentId: anotherAmendmentId,
        facilityId: anotherFacilityId,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails,
        bankId,
        bankName,
        requestDate,
      });

      // Assert
      expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledTimes(2);
      expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledWith(anotherFacilityId, anotherAmendmentId);
    });

    describe('when calling TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', () => {
      it('should throw an AmendmentNotFoundError if no amendment is found', async () => {
        // Arrange
        mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(null);

        // Act
        const returned = PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
          amendmentId,
          facilityId,
          newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          referenceNumber,
          auditDetails,
          bankId,
          bankName,
          requestDate,
        });

        // Assert
        await expect(returned).rejects.toThrow(new AmendmentNotFoundError(amendmentId, facilityId));
      });

      it(`should throw an AmendmentNotFoundError if an amendment without a ${AMENDMENT_TYPES.PORTAL} amendment type is returned`, async () => {
        // Arrange
        mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce({ ...updatedAmendment, type: AMENDMENT_TYPES.TFM });

        // Act
        const returned = PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
          amendmentId,
          facilityId,
          newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          referenceNumber,
          auditDetails,
          bankId,
          bankName,
          requestDate,
        });

        // Assert
        await expect(returned).rejects.toThrow(new AmendmentNotFoundError(amendmentId, facilityId));
        expect(console.error).toHaveBeenCalledWith('Amendment with facilityId %s and amendmentId %s is not a portal amendment', facilityId, amendmentId);
      });
    });

    it('should call PortalFacilityAmendmentService.validateNoOtherAmendmentInProgress', async () => {
      // Arrange
      const existingAmendment = aPortalFacilityAmendment();
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(existingAmendment);

      // Act
      await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
        amendmentId,
        facilityId,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails,
        bankId,
        bankName,
        requestDate,
      });

      // Assert
      expect(mockValidateNoOtherAmendmentInProgressOnFacility).toHaveBeenCalledTimes(1);
      expect(mockValidateNoOtherAmendmentInProgressOnFacility).toHaveBeenCalledWith({
        facilityId: existingAmendment.facilityId.toString(),
        amendmentId,
      });
    });

    it('should call TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
        amendmentId,
        facilityId,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails,
        bankId,
        bankName,
        requestDate,
      });

      // Assert
      const expectedUpdate = {
        status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
      };

      const now = new Date();
      now.setSeconds(0, 0);

      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledTimes(1);
      expect(mockUpdatePortalFacilityAmendmentByAmendmentId).toHaveBeenCalledWith({
        update: expectedUpdate,
        facilityId: new ObjectId(facilityId),
        amendmentId: new ObjectId(amendmentId),
        auditDetails,
        allowedStatuses: [PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL],
      });
    });

    it('should call TfmActivitiesRepo.submitTfmActivity with the correct params', async () => {
      // Act
      await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
        amendmentId,
        facilityId,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails,
        bankId,
        bankName,
        requestDate,
      });

      const now = new Date();
      now.setSeconds(0, 0);

      const expectedActivity = {
        type: ACTIVITY_TYPES.ACTIVITY,
        timestamp: getUnixTime(now),
        author: {
          firstName: bankName,
          lastName: bankId,
          _id: '',
        },
        label: `Amendment ${referenceNumber} Approved`,
        text: '',
      };

      expect(mockAddTfmActivity).toHaveBeenCalledTimes(1);
      expect(mockAddTfmActivity).toHaveBeenCalledWith({
        dealId: updatedAmendment.dealId,
        auditDetails,
        activity: expectedActivity,
      });
    });

    it('should return the result of TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
      // Act
      const expected = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
        amendmentId,
        facilityId,
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails,
        bankId,
        bankName,
        requestDate,
      });

      // Assert
      expect(expected).toEqual(updatedAmendment);
    });
  });
});
