import httpMocks from 'node-mocks-http';
import { EstoreRepo } from '../../../repositories/estore/estore-repo';
import { getCollection } from '../../../database';
import { EstoreRequest } from '../../../helpers/types/estore';
import { EMAIL_TEMPLATES } from '../../../constants';
import { eStoreSiteCreationCronJob, eStoreTermStoreCreationJob } from '../../../cron';
import { sendEmail } from '../email.controller';
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

  it.each(['lookup', 'collection acquisition'])('sends an alert and a 500 response after %s and failure-log writes reject', async (failure) => {
    const error = new Error('Database unavailable');
    const logError = new Error('Failure log collection unavailable');
    const { req, res } = httpMocks.createMocks<EstoreRequest>({
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
    });

    if (failure === 'lookup') {
      jest.mocked(EstoreRepo.findByDealId).mockRejectedValueOnce(error);
    } else {
      jest.mocked(getCollection).mockRejectedValueOnce(error);
    }

    jest.mocked(EstoreRepo.updateByDealId).mockRejectedValueOnce(logError);

    await expect(create(req, res)).resolves.toBe(res);

    expect(EstoreRepo.insertOne).not.toHaveBeenCalled();
    expect(siteExists).not.toHaveBeenCalled();
    expect(createExporterSite).not.toHaveBeenCalled();
    expect(eStoreSiteCreationCronJob).not.toHaveBeenCalled();
    expect(eStoreTermStoreCreationJob).not.toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATES.ESTORE_FAILED, expect.any(String), { dealIdentifier: req.body.dealIdentifier });
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual({ status: 500, message: 'Unable to create eStore directories' });
    expect(console.error).toHaveBeenCalledWith('❌ Unable to create eStore directories %o', error);
    expect(console.error).toHaveBeenCalledWith('Unable to record eStore directory creation failure for deal %s %o', req.body.dealId, logError);
  });
});
