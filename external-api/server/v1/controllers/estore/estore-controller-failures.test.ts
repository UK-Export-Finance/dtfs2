import { Response } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { EstoreRepo } from '@ukef/external-api/server/repositories/estore/estore-repo';
import { getCollection } from '@ukef/external-api/server/database';
import { EstoreRequest } from '@ukef/external-api/server/helpers/types/estore';
import { EMAIL_TEMPLATES } from '@ukef/external-api/server/constants';
import { eStoreSiteCreationCronJob, eStoreTermStoreCreationJob } from '@ukef/external-api/server/cron';
import { sendEmail } from '@ukef/external-api/server/v1/controllers/email.controller';
import { createExporterSite, siteExists } from './eStoreApi';
import { create } from './eStore.controller';

jest.mock('../../../repositories/estore/estore-repo');
jest.mock('../../../database', () => ({ getCollection: jest.fn(async () => ({})) }));
jest.mock('../../../helpers', () => ({
  objectIsEmpty: jest.fn(() => false),
  areValidUkefIds: jest.fn(() => true),
}));
jest.mock('../../../cron', () => ({
  eStoreSiteCreationCronJob: jest.fn(),
  eStoreTermStoreCreationJob: jest.fn(),
}));
jest.mock('../email.controller', () => ({ sendEmail: jest.fn() }));
jest.mock('./eStoreApi', () => ({
  siteExists: jest.fn(),
  createExporterSite: jest.fn(),
}));

describe('eStore controller database failures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each(['lookup', 'collection acquisition'])('when %s and failure-log writes reject', (failure) => {
    const error = new Error('Database unavailable');
    const logError = new Error('Failure log collection unavailable');
    let req: MockRequest<EstoreRequest>;
    let res: MockResponse<Response>;
    let result: Response;

    beforeEach(async () => {
      ({ req, res } = httpMocks.createMocks<EstoreRequest>({
        body: {
          dealId: '507f1f77bcf86cd799439011',
          dealIdentifier: 'deal-identifier',
          facilityIdentifiers: [1234567890],
          supportingInformation: [],
          exporterName: 'Exporter',
          buyerName: 'Buyer',
          siteId: 'site-id',
          destinationMarket: 'GBR',
          riskMarket: 'GBR',
        },
      }));

      if (failure === 'lookup') {
        jest.mocked(EstoreRepo.findByDealId).mockRejectedValueOnce(error);
      } else {
        jest.mocked(getCollection).mockRejectedValueOnce(error);
      }

      jest.mocked(EstoreRepo.updateByDealId).mockRejectedValueOnce(logError);

      result = await create(req, res);
    });

    it('should return the response', () => {
      expect(result).toBe(res);
    });

    it('should not call EstoreRepo.insertOne', () => {
      expect(EstoreRepo.insertOne).not.toHaveBeenCalled();
    });

    it('should not call siteExists', () => {
      expect(siteExists).not.toHaveBeenCalled();
    });

    it('should not call createExporterSite', () => {
      expect(createExporterSite).not.toHaveBeenCalled();
    });

    it('should not call eStoreSiteCreationCronJob', () => {
      expect(eStoreSiteCreationCronJob).not.toHaveBeenCalled();
    });

    it('should not call eStoreTermStoreCreationJob', () => {
      expect(eStoreTermStoreCreationJob).not.toHaveBeenCalled();
    });

    it('should call sendEmail with the failure template and deal identifier', () => {
      expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATES.ESTORE_FAILED, expect.any(String), { dealIdentifier: req.body.dealIdentifier });
    });

    it('should respond with a 500 status code', () => {
      expect(res._getStatusCode()).toBe(500);
    });

    it('should respond with the directory creation failure message', () => {
      expect(res._getData()).toEqual({ status: 500, message: 'Unable to create eStore directories' });
    });

    it('should log the directory creation error', () => {
      expect(console.error).toHaveBeenCalledWith('❌ Unable to create eStore directories %o', error);
    });

    it('should log the failure-log write error', () => {
      expect(console.error).toHaveBeenCalledWith('Unable to record eStore directory creation failure for deal %s %o', req.body.dealId, logError);
    });
  });
});
