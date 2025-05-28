import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { AMENDMENT_QUERIES, PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { aCompletedTfmFacilityAmendment, aTfmFacilityAmendment } from '../../../../../test-helpers';
import { getAmendmentsByDealId } from './tfm-get-amendments.controller';
import { AMENDMENT_QUERY_STATUSES } from '../../../../constants';

const mockFindTfmAmendmentsByDealIdAndStatus = jest.fn();
const mockFindLatestCompletedAmendmentByDealId = jest.fn();
const mockFindAllTypeAmendmentsByDealIdAndStatus = jest.fn();
const mockFindAmendmentsByDealId = jest.fn();

const dealId = new ObjectId().toString();

const aTfmAmendment = aTfmFacilityAmendment();
const aCompletedTfmAmendment = { ...aCompletedTfmFacilityAmendment(), value: 1000000, currency: 'GBP' };

describe('getAmendmentsByDealId', () => {
  beforeAll(() => {
    jest.spyOn(TfmFacilitiesRepo, 'findTfmAmendmentsByDealIdAndStatus').mockImplementation(mockFindTfmAmendmentsByDealIdAndStatus);
    jest.spyOn(TfmFacilitiesRepo, 'findLatestCompletedAmendmentByDealId').mockImplementation(mockFindLatestCompletedAmendmentByDealId);
    jest.spyOn(TfmFacilitiesRepo, 'findAllTypeAmendmentsByDealIdAndStatus').mockImplementation(mockFindAllTypeAmendmentsByDealIdAndStatus);
    jest.spyOn(TfmFacilitiesRepo, 'findAmendmentsByDealId').mockImplementation(mockFindAmendmentsByDealId);

    mockFindTfmAmendmentsByDealIdAndStatus.mockResolvedValue([aTfmAmendment]);
    mockFindLatestCompletedAmendmentByDealId.mockResolvedValue(aCompletedTfmAmendment);
    mockFindAllTypeAmendmentsByDealIdAndStatus.mockResolvedValue([aCompletedTfmAmendment, aTfmAmendment]);
    mockFindAmendmentsByDealId.mockResolvedValue([aCompletedTfmAmendment, aTfmAmendment]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should call findTfmAmendmentsByDealIdAndStatus when status is ${AMENDMENT_QUERY_STATUSES.IN_PROGRESS}`, async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId, status: AMENDMENT_QUERY_STATUSES.IN_PROGRESS },
    });

    await getAmendmentsByDealId(req, res);

    expect(mockFindTfmAmendmentsByDealIdAndStatus).toHaveBeenCalledWith(dealId, TFM_AMENDMENT_STATUS.IN_PROGRESS);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aTfmAmendment]);
  });

  it(`should call findLatestCompletedAmendmentByDealId when status is ${AMENDMENT_QUERY_STATUSES.COMPLETED} and type is ${AMENDMENT_QUERIES.LATEST}`, async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId, status: AMENDMENT_QUERY_STATUSES.COMPLETED, type: AMENDMENT_QUERIES.LATEST },
    });

    await getAmendmentsByDealId(req, res);

    expect(mockFindLatestCompletedAmendmentByDealId).toHaveBeenCalledWith(dealId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual({
      amendmentId: aCompletedTfmAmendment.amendmentId.toString(),
      value: aCompletedTfmAmendment.value,
      currency: aCompletedTfmAmendment.currency,
    });
  });

  it(`should call findAllTypeAmendmentsByDealIdAndStatus when status is ${AMENDMENT_QUERY_STATUSES.ACKNOWLEDGEDORCOMPLETED}`, async () => {
    const statuses = [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, TFM_AMENDMENT_STATUS.COMPLETED];
    const { req, res } = httpMocks.createMocks({
      params: { dealId, status: AMENDMENT_QUERY_STATUSES.ACKNOWLEDGEDORCOMPLETED },
    });

    await getAmendmentsByDealId(req, res);

    expect(mockFindAllTypeAmendmentsByDealIdAndStatus).toHaveBeenCalledWith({ dealId, statuses });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aCompletedTfmAmendment, aTfmAmendment]);
  });

  it('should call findAmendmentsByDealId when no status and type are provided', async () => {
    const { req, res } = httpMocks.createMocks({
      params: { dealId },
    });

    await getAmendmentsByDealId(req, res);

    expect(mockFindAmendmentsByDealId).toHaveBeenCalledWith(dealId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual([aCompletedTfmAmendment, aTfmAmendment]);
  });
});
