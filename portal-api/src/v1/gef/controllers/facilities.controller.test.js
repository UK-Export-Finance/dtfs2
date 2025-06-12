const { ObjectId } = require('mongodb');
const httpMocks = require('node-mocks-http');
const { HttpStatusCode } = require('axios');
const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { mongoDbClient: db } = require('../../../drivers/db-client');
const api = require('../../api');
const controller = require('./facilities.controller');

const mockGefFacilitiesByDealId = jest.fn();
const mockAcknowledgedAmendmentsByFacilityId = jest.fn();

const dealId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const mockFacilities = [
  {
    _id: facilityId,
    dealId,
    hasBeenIssued: true,
    name: 'Facility one',
    shouldCoverStartOnSubmission: false,
    coverStartDate: '2021-12-03T00:00:00.000Z',
    coverEndDate: '2040-01-01T00:00:00.000Z',
    monthsOfCover: null,
    coverPercentage: 80,
    interestPercentage: 1,
  },
  {
    _id: new ObjectId().toString(),
    dealId,
    hasBeenIssued: true,
    name: 'Facility one',
    shouldCoverStartOnSubmission: false,
    coverStartDate: '2021-12-03T00:00:00.000Z',
    coverEndDate: '2040-01-01T00:00:00.000Z',
    monthsOfCover: null,
    coverPercentage: 80,
    interestPercentage: 1,
  },
];

const amendments = [
  { dealId, facilityId, amendmentId, status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED },
  { dealId, facilityId, amendmentId, status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED },
];

const getHttpMocks = () =>
  httpMocks.createMocks({
    query: { dealId },
  });

let mockDatabase = {};

describe('getFacilitiesByDealId', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    const mockCollection = {
      findOne: jest.fn().mockReturnThis([{ _id: dealId, version: 1 }]),
    };

    jest.spyOn(api, 'findGefFacilitiesByDealId').mockImplementation(mockGefFacilitiesByDealId);
    jest.spyOn(api, 'getAcknowledgedAmendmentsByFacilityId').mockImplementation(mockAcknowledgedAmendmentsByFacilityId);

    mockGefFacilitiesByDealId.mockResolvedValue(mockFacilities);
    mockAcknowledgedAmendmentsByFacilityId.mockResolvedValue(amendments);

    mockDatabase = {
      getCollection: jest.fn().mockResolvedValue(mockCollection),
    };

    db.getCollection = mockDatabase.getCollection;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
    beforeEach(() => {
      jest.spyOn(controller, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(false);
    });

    it(`should throw ${HttpStatusCode.NotFound} when deal is not found`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      mockDatabase.getCollection.mockResolvedValueOnce({
        findOne: jest.fn().mockResolvedValueOnce(null),
      });

      // Act
      await controller.getFacilitiesByDealId(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('should get facilities on deal with the correct result', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await controller.getFacilitiesByDealId(req, res);

      const expectedItems = mockFacilities.map((facility) => ({
        status: 'Not started',
        details: facility,
        validation: { required: ['type', 'details', 'currency', 'value', 'feeType', 'feeFrequency', 'dayCountBasis'] },
      }));

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getAcknowledgedAmendmentsByFacilityId).toHaveBeenCalledTimes(0);
      expect(res._getData()).toEqual({
        status: 'Not started',
        items: expectedItems,
      });
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
    beforeEach(() => {
      jest.spyOn(controller, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    });

    it(`should throw ${HttpStatusCode.NotFound} when deal is not found`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      mockDatabase.getCollection.mockResolvedValueOnce({
        findOne: jest.fn().mockResolvedValueOnce(null),
      });

      // Act
      await controller.getFacilitiesByDealId(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it('should get facilities on deal with the correct result', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await controller.getFacilitiesByDealId(req, res);

      const expectedItems = mockFacilities.map((facility) => ({
        status: 'Not started',
        details: facility,
        validation: { required: ['type', 'details', 'currency', 'value', 'feeType', 'feeFrequency', 'dayCountBasis'] },
      }));

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getAcknowledgedAmendmentsByFacilityId).toHaveBeenCalledTimes(2);
      expect(res._getData()).toEqual({
        status: 'Not started',
        items: expectedItems,
      });
    });
  });
});
