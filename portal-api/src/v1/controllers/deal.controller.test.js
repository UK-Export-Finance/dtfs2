const { ObjectId } = require('mongodb');
const { add } = require('date-fns');
const httpMocks = require('node-mocks-http');
const { HttpStatusCode } = require('axios');
const { PORTAL_AMENDMENT_STATUS, getUnixTimestampSeconds, getEpochMs } = require('@ukef/dtfs2-common');
const { mongoDbClient: db } = require('../../drivers/db-client');
const api = require('../api');
const controller = require('./deal.controller');

const mockGetFacilityAmendmentsOnDeal = jest.fn();

const dealId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

const nowDate = new Date();
const tomorrow = add(nowDate, { days: 1 });

const mockDeal = {
  status: 'Acknowledged',
  updatedAt: getEpochMs(nowDate),
};

const amendments = [{ dealId, facilityId, amendmentId, status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED }];

const getHttpMocks = () =>
  httpMocks.createMocks({
    query: { dealId },
  });

let mockDatabase = {};

describe('getQueryAllDeals', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const mockToArray = jest.fn().mockResolvedValue([
      {
        deals: [mockDeal],
        count: 1,
      },
    ]);
    const mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });

    jest.spyOn(api, 'getFacilityAmendmentsOnDeal').mockImplementation(mockGetFacilityAmendmentsOnDeal);

    mockDatabase = {
      getCollection: jest.fn().mockResolvedValue({ aggregate: mockAggregate }),
    };

    mockGetFacilityAmendmentsOnDeal.mockResolvedValue([]);
    db.getCollection = mockDatabase.getCollection;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled or not specified', () => {
    beforeEach(() => {
      jest.spyOn(controller, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(false);
    });

    it('should get facility amendments on deal with the correct result', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await controller.getQueryAllDeals(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(0);
      expect(res._getData()).toEqual({
        deals: [mockDeal],
        count: 1,
      });
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
    beforeEach(() => {
      jest.spyOn(controller, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    });

    it('should get all deals without update the updatedAt when there are no completed portal amendments on deal', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await controller.getQueryAllDeals(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(res._getData()).toEqual({
        deals: [mockDeal],
        count: 1,
      });
    });

    it('should get all deals without update the updatedAt when completed portal amendments are effective in the future', async () => {
      // Arrange
      mockGetFacilityAmendmentsOnDeal.mockResolvedValue([{ ...amendments, updatedAt: getUnixTimestampSeconds(tomorrow) }]);
      const { req, res } = getHttpMocks();

      // Act
      await controller.getQueryAllDeals(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(res._getData()).toEqual({
        deals: [mockDeal],
        count: 1,
      });
    });

    it('should get all deals with updatedAt the date the completed portal amendment be approved', async () => {
      // Arrange
      mockGetFacilityAmendmentsOnDeal.mockResolvedValue([{ ...amendments, updatedAt: getUnixTimestampSeconds(nowDate) }]);
      const { req, res } = getHttpMocks();

      // Act
      await controller.getQueryAllDeals(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(api.getFacilityAmendmentsOnDeal).toHaveBeenCalledTimes(1);
      expect(res._getData()).toEqual({
        deals: [{ ...mockDeal, updatedAt: getEpochMs(nowDate) }],
        count: 1,
      });
    });
  });
});
