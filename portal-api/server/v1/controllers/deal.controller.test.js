const { ObjectId } = require('mongodb');
const httpMocks = require('node-mocks-http');
const { HttpStatusCode } = require('axios');
const { DEAL_STATUS } = require('@ukef/dtfs2-common');
const { mongoDbClient: db } = require('../../drivers/db-client');
const controller = require('./deal.controller');

const dealId = new ObjectId().toString();

const mockDeal = {
  _id: '1',
  status: DEAL_STATUS.ACKNOWLEDGED,
};

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

    mockDatabase = {
      getCollection: jest.fn().mockResolvedValue({ aggregate: mockAggregate }),
    };

    db.getCollection = mockDatabase.getCollection;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should get all deals with the correct result', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await controller.getQueryAllDeals(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual({
      deals: [mockDeal],
      count: 1,
    });
  });
});
