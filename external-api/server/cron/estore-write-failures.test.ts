import { ObjectId, UpdateResult } from 'mongodb';
import { EstoreRepo } from '../repositories/estore/estore-repo';
import { cron } from '../helpers/cron';
import { Estore } from '../interfaces';
import { ENDPOINT, ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../constants';
import { siteExists, createBuyerFolder } from '../v1/controllers/estore/eStoreApi';
import { eStoreSiteCreationCronJob } from './eStoreSiteCreationJob.cron';
import { eStoreBuyerDirectoryCreationJob } from './eStoreBuyerDirectoryCreationJob.cron';
import { eStoreTermStoreCreationJob } from './eStoreTermStoreCreationJob.cron';
import { eStoreDealDirectoryCreationJob } from './eStoreDealDirectoryCreationJob.cron';

jest.mock('../repositories/estore/estore-repo');
jest.mock('../helpers/cron', () => ({ cron: jest.fn() }));
jest.mock('../v1/controllers/estore/eStoreApi', () => ({
  siteExists: jest.fn(),
  createBuyerFolder: jest.fn(),
}));
jest.mock('./eStoreTermStoreCreationJob.cron', () => ({ eStoreTermStoreCreationJob: jest.fn() }));
jest.mock('./eStoreDealDirectoryCreationJob.cron', () => ({ eStoreDealDirectoryCreationJob: jest.fn() }));

describe('eStore cron database write failures', () => {
  const data: Estore = {
    dealId: '507f1f77bcf86cd799439011',
    siteId: 'site-id',
    exporterName: 'Exporter',
    buyerName: 'Buyer',
    dealIdentifier: 'deal-identifier',
    facilityIdentifiers: [],
    supportingInformation: [],
    destinationMarket: 'GBR',
    riskMarket: 'GBR',
  };
  const result: UpdateResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: new ObjectId(data.dealId) };
  const updateByDealId = jest.mocked(EstoreRepo.updateByDealId);
  const updateTfmDealByDealId = jest.mocked(EstoreRepo.updateTfmDealByDealId);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    updateByDealId.mockResolvedValue(result);
    updateTfmDealByDealId.mockResolvedValue(result);
    jest.mocked(siteExists).mockResolvedValue({ status: 200, data: { status: ESTORE_SITE_STATUS.CREATED, siteId: data.siteId } });
    jest.mocked(createBuyerFolder).mockResolvedValue({ status: 201, data: { buyerName: data.buyerName } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([
    { name: 'site', run: eStoreSiteCreationCronJob, next: eStoreTermStoreCreationJob, category: ENDPOINT.SITE, statusKey: 'cron.site.create' },
    { name: 'buyer', run: eStoreBuyerDirectoryCreationJob, next: eStoreDealDirectoryCreationJob, category: ENDPOINT.BUYER, statusKey: 'cron.buyer' },
  ])('$name job', ({ run, next, category, statusKey }) => {
    it('advances after successful writes', async () => {
      await run(data);

      expect(next).toHaveBeenCalledWith(data);
      expect(cron).toHaveBeenCalledWith({ data, category, kill: true });
    });

    it('does not advance when persisting completion rejects', async () => {
      const error = new Error('Completion write failed');
      updateByDealId.mockRejectedValueOnce(error);

      await run(data);

      expect(next).not.toHaveBeenCalled();
      expect(updateTfmDealByDealId).not.toHaveBeenCalled();
      expect(updateByDealId).toHaveBeenLastCalledWith(
        data.dealId,
        expect.objectContaining({
          [statusKey]: expect.objectContaining({ status: ESTORE_CRON_STATUS.FAILED, error: String(error) }),
        }),
      );
      expect(cron).toHaveBeenCalledWith({ data, category, kill: true });
      expect(console.error).toHaveBeenCalledWith(expect.any(String), data.dealId, error);
    });

    it('still stops and logs the original failure when recording failure also rejects', async () => {
      const error = new Error('Completion write failed');
      const logError = new Error('Failure status write failed');
      updateByDealId.mockRejectedValueOnce(error).mockRejectedValueOnce(logError);

      await run(data);

      expect(next).not.toHaveBeenCalled();
      expect(cron).toHaveBeenCalledWith({ data, category, kill: true });
      expect(console.error).toHaveBeenCalledWith(expect.any(String), data.dealId, logError);
      expect(console.error).toHaveBeenCalledWith(expect.any(String), data.dealId, error);
    });
  });

  it('does not start term-store creation when persisting the TFM site name rejects', async () => {
    const error = new Error('TFM site name write failed');
    updateTfmDealByDealId.mockRejectedValueOnce(error);

    await eStoreSiteCreationCronJob(data);

    expect(updateTfmDealByDealId).toHaveBeenCalledWith(data.dealId, { 'tfm.estore.siteName': data.siteId });
    expect(eStoreTermStoreCreationJob).not.toHaveBeenCalled();
    expect(updateByDealId).toHaveBeenLastCalledWith(
      data.dealId,
      expect.objectContaining({
        'cron.site.create': expect.objectContaining({ status: ESTORE_CRON_STATUS.FAILED, error: String(error) }),
      }),
    );
    expect(cron).toHaveBeenCalledWith({ data, category: ENDPOINT.SITE, kill: true });
    expect(console.error).toHaveBeenCalledWith(expect.any(String), data.dealId, error);
  });
});
