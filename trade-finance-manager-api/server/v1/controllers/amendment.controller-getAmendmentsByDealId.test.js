import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { AMENDMENT_QUERIES, AMENDMENT_QUERY_STATUSES } from '@ukef/dtfs2-common';
import api from '../api';
import { getAmendmentsByDealId } from './amendment.controller';
import { aCompletedTfmFacilityAmendment, aTfmFacilityAmendment } from '../../../test-helpers';

jest.mock('../api', () => ({
  getAmendmentInProgressByDealId: jest.fn(),
  getLatestCompletedAmendmentByDealId: jest.fn(),
  getCompletedAmendmentByDealId: jest.fn(),
  getApprovedAmendments: jest.fn(),
  getAmendmentsByDealId: jest.fn(),
}));

const mockGetAmendmentInProgressByDealId = jest.fn();
const mockGetLatestCompletedAmendmentByDealId = jest.fn();
const mockGetCompletedAmendmentByDealId = jest.fn();
const mockGetApprovedAmendments = jest.fn();
const mockGetAmendmentsByDealId = jest.fn();

const dealId = new ObjectId().toString();

const aTfmAmendment = aTfmFacilityAmendment();
const aCompletedTfmAmendment = aCompletedTfmFacilityAmendment();

describe('getAmendmentsByDealId', () => {
  beforeAll(() => {
    jest.spyOn(api, 'getAmendmentInProgressByDealId').mockImplementation(mockGetAmendmentInProgressByDealId);
    jest.spyOn(api, 'getLatestCompletedAmendmentByDealId').mockImplementation(mockGetLatestCompletedAmendmentByDealId);
    jest.spyOn(api, 'getCompletedAmendmentByDealId').mockImplementation(mockGetCompletedAmendmentByDealId);
    jest.spyOn(api, 'getApprovedAmendments').mockImplementation(mockGetApprovedAmendments);
    jest.spyOn(api, 'getAmendmentsByDealId').mockImplementation(mockGetAmendmentsByDealId);

    mockGetAmendmentInProgressByDealId.mockResolvedValue([aTfmAmendment]);
    mockGetLatestCompletedAmendmentByDealId.mockResolvedValue([aCompletedTfmAmendment]);
    mockGetCompletedAmendmentByDealId.mockResolvedValue([aCompletedTfmAmendment]);
    mockGetApprovedAmendments.mockResolvedValue([aCompletedTfmAmendment]);
    mockGetAmendmentsByDealId.mockResolvedValue([aTfmAmendment, aCompletedTfmAmendment]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should call getAmendmentInProgressByDealId when status is ${AMENDMENT_QUERY_STATUSES.IN_PROGRESS}`, async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId, status: AMENDMENT_QUERY_STATUSES.IN_PROGRESS },
    });

    await getAmendmentsByDealId(req, res);

    expect(mockGetAmendmentInProgressByDealId).toHaveBeenCalledWith(dealId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aTfmAmendment]);
  });

  it(`should call getLatestCompletedAmendmentByDealId when status is ${AMENDMENT_QUERY_STATUSES.COMPLETED} and type is ${AMENDMENT_QUERIES.LATEST}`, async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId, status: AMENDMENT_QUERY_STATUSES.COMPLETED, type: AMENDMENT_QUERIES.LATEST },
    });

    await getAmendmentsByDealId(req, res);

    expect(mockGetLatestCompletedAmendmentByDealId).toHaveBeenCalledWith(dealId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aCompletedTfmAmendment]);
  });

  it(`should call getApprovedAmendments when status is ${AMENDMENT_QUERY_STATUSES.APPROVED}`, async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId, status: AMENDMENT_QUERY_STATUSES.APPROVED },
    });

    await getAmendmentsByDealId(req, res);

    expect(api.getApprovedAmendments).toHaveBeenCalledWith(dealId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aCompletedTfmAmendment]);
  });

  it('should call getAmendmentsByDealId when no status and type are provided', async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId },
    });

    await getAmendmentsByDealId(req, res);

    expect(api.getAmendmentsByDealId).toHaveBeenCalledWith(dealId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aTfmAmendment, aCompletedTfmAmendment]);
  });

  it(`should return ${HttpStatusCode.UnprocessableEntity} if no amendment is found`, async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId },
    });
    api.getAmendmentsByDealId.mockResolvedValue(undefined);

    await getAmendmentsByDealId(req, res);

    expect(res._getStatusCode()).toBe(HttpStatusCode.UnprocessableEntity);
    expect(res._getData()).toEqual({ data: 'Unable to get the amendments by deal Id' });
  });
});
