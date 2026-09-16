import { CronJob } from 'cron';
import { ENDPOINT } from '../constants';
import { EstoreCronJob } from '../interfaces';
import { Category } from './types/estore';
import {
  eStoreBuyerDirectoryCreationJob,
  eStoreDealDirectoryCreationJob,
  eStoreDocumentsCreationJob,
  eStoreFacilityDirectoryCreationJob,
  eStoreSiteCreationCronJob,
  eStoreTermStoreCreationJob,
} from '../cron';
import { cron } from './cron';

jest.mock('cron', () => ({
  CronJob: jest.fn(),
}));

jest.mock('../cron', () => ({
  eStoreSiteCreationCronJob: jest.fn(),
  eStoreTermStoreCreationJob: jest.fn(),
  eStoreBuyerDirectoryCreationJob: jest.fn(),
  eStoreDealDirectoryCreationJob: jest.fn(),
  eStoreFacilityDirectoryCreationJob: jest.fn(),
  eStoreDocumentsCreationJob: jest.fn(),
}));

const mockedCronJob = CronJob as unknown as jest.Mock;
const mockedSiteCreationJob = eStoreSiteCreationCronJob as jest.Mock;
const mockedTermCreationJob = eStoreTermStoreCreationJob as jest.Mock;
const mockedBuyerCreationJob = eStoreBuyerDirectoryCreationJob as jest.Mock;
const mockedDealCreationJob = eStoreDealDirectoryCreationJob as jest.Mock;
const mockedFacilityCreationJob = eStoreFacilityDirectoryCreationJob as jest.Mock;
const mockedDocumentsCreationJob = eStoreDocumentsCreationJob as jest.Mock;

/**
 * Builds the payload for a test cron job.
 * @param dealId The ID of the deal.
 * @param category The category of the cron job.
 * @param kill Whether to kill the job.
 * @returns The payload for the cron job.
 */
const buildCronPayload = (dealId: string, category: Category = ENDPOINT.SITE, kill = false): EstoreCronJob => ({
  data: {
    dealId,
    siteId: 'site-1',
    facilityIdentifiers: [1001],
    supportingInformation: [],
    exporterName: 'Exporter Ltd',
    buyerName: 'Buyer Ltd',
    dealIdentifier: 'D-001',
    destinationMarket: 'UK',
    riskMarket: 'UK',
  },
  category,
  kill,
});

describe('cron', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return false when kill is requested and no job exists', () => {
    const result = cron(buildCronPayload('deal-no-job', ENDPOINT.SITE, true));

    expect(result).toBe(false);
  });

  it('should create and start a job when one does not exist and is inactive', () => {
    // Arrange
    const start = jest.fn();

    mockedCronJob.mockImplementation(() => ({
      start,
      stop: jest.fn(),
      isActive: false,
    }));

    // Act
    const result = cron(buildCronPayload('deal-create-success'));

    // Assert
    expect(result).toBe(false);
    expect(mockedCronJob).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('should return false when a job already exists for the same deal and category', () => {
    // Arrange
    mockedCronJob.mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      isActive: false,
    }));

    // Act
    cron(buildCronPayload('deal-duplicate'));
    const result = cron(buildCronPayload('deal-duplicate'));

    // Assert
    expect(result).toBe(false);
    expect(mockedCronJob).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(
      '⚠️ eStore %s CRON %s already exists for deal %s.',
      ENDPOINT.SITE,
      `estore_cron_${ENDPOINT.SITE}_deal-duplicate`,
      'D-001',
    );
  });

  it('should stop an existing job and return true when kill is requested', () => {
    // Arrange
    const stop = jest.fn().mockReturnValue(undefined);
    const start = jest.fn();

    mockedCronJob.mockImplementation(() => ({
      start,
      stop,
      isActive: false,
    }));

    // Act
    cron(buildCronPayload('deal-stop-success'));
    const result = cron(buildCronPayload('deal-stop-success', ENDPOINT.SITE, true));

    // Assert
    expect(result).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('should remove a stopped job so it can be re-created', () => {
    // Arrange
    const firstStop = jest.fn().mockReturnValue(undefined);
    const firstStart = jest.fn();
    const secondStart = jest.fn();

    mockedCronJob
      .mockImplementationOnce(() => ({
        start: firstStart,
        stop: firstStop,
        isActive: false,
      }))
      .mockImplementationOnce(() => ({
        start: secondStart,
        stop: jest.fn(),
        isActive: false,
      }));

    // Act
    cron(buildCronPayload('deal-recreate'));
    cron(buildCronPayload('deal-recreate', ENDPOINT.SITE, true));
    const recreateResult = cron(buildCronPayload('deal-recreate'));

    // Assert
    expect(recreateResult).toBe(false);
    expect(firstStop).toHaveBeenCalledTimes(1);
    expect(secondStart).toHaveBeenCalledTimes(1);
    expect(mockedCronJob).toHaveBeenCalledTimes(2);
  });

  it('should handle a rejected async stop without throwing and should log an error', async () => {
    // Arrange
    const stopError = new Error('stop failed');
    const stop = jest.fn().mockReturnValue(Promise.reject(stopError));
    const start = jest.fn();

    mockedCronJob.mockImplementation(() => ({
      start,
      stop,
      isActive: false,
    }));

    const dealId = 'deal-stop-reject';

    // Act
    cron(buildCronPayload(dealId));
    const result = cron(buildCronPayload(dealId, ENDPOINT.SITE, true));

    // Assert
    await Promise.resolve();

    expect(result).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      'Failed to stop eStore %s CRON %s for deal %s. Error: %o',
      ENDPOINT.SITE,
      `estore_cron_${ENDPOINT.SITE}_${dealId}`,
      'D-001',
      stopError,
    );
  });

  it('should route onTick to the correct category handler functions', async () => {
    // Arrange
    mockedCronJob.mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      isActive: false,
    }));

    const scenarios = [
      { category: ENDPOINT.SITE, handler: mockedSiteCreationJob, dealId: 'deal-site' },
      { category: ENDPOINT.TERM, handler: mockedTermCreationJob, dealId: 'deal-term' },
      { category: ENDPOINT.BUYER, handler: mockedBuyerCreationJob, dealId: 'deal-buyer' },
      { category: ENDPOINT.DEAL, handler: mockedDealCreationJob, dealId: 'deal-deal' },
      { category: ENDPOINT.FACILITY, handler: mockedFacilityCreationJob, dealId: 'deal-facility' },
      { category: ENDPOINT.DOCUMENT, handler: mockedDocumentsCreationJob, dealId: 'deal-document' },
    ];

    for (const scenario of scenarios) {
      // Act
      cron(buildCronPayload(scenario.dealId, scenario.category));

      const cronJobCalls = mockedCronJob.mock.calls as Array<[string, () => Promise<void>, () => void]>;
      const latestCall = cronJobCalls[cronJobCalls.length - 1];
      const onTick = latestCall[1];

      await onTick();

      // Assert
      expect(scenario.handler).toHaveBeenCalledWith(expect.objectContaining({ dealId: scenario.dealId }));
    }
  });

  it('should log successful completion via onComplete callback', () => {
    // Arrange
    mockedCronJob.mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      isActive: false,
    }));

    const dealId = 'deal-complete';

    // Act
    cron(buildCronPayload(dealId));

    const cronJobCalls = mockedCronJob.mock.calls as Array<[string, () => Promise<void>, () => void]>;
    const onComplete = cronJobCalls[0][2];

    onComplete();

    // Assert
    expect(console.info).toHaveBeenNthCalledWith(1, '⚡ eStore %s CRON has been initiated for deal %s.', ENDPOINT.SITE, 'D-001');
    expect(console.info).toHaveBeenNthCalledWith(2, '✅ eStore %s CRON has been completed successfully for deal %s', ENDPOINT.SITE, dealId);
  });
});
