import { EstoreRepo } from '@ukef/external-api/server/repositories/estore/estore-repo';
import { cron } from '@ukef/external-api/server/helpers/cron';
import { Estore } from '@ukef/external-api/server/interfaces';
import { ENDPOINT } from '@ukef/external-api/server/constants';
import {
  addFacilityToTermStore,
  createDealFolder,
  createFacilityFolder,
  uploadSupportingDocuments,
} from '@ukef/external-api/server/v1/controllers/estore/eStoreApi';
import { eStoreTermStoreCreationJob } from './eStoreTermStoreCreationJob.cron';
import { eStoreDealDirectoryCreationJob } from './eStoreDealDirectoryCreationJob.cron';
import { eStoreFacilityDirectoryCreationJob } from './eStoreFacilityDirectoryCreationJob.cron';
import { eStoreDocumentsCreationJob } from './eStoreDocumentsCreationJob.cron';

jest.mock('../repositories/estore/estore-repo');
jest.mock('../helpers/cron', () => ({ cron: jest.fn() }));
jest.mock('../v1/controllers/estore/eStoreApi', () => ({
  addFacilityToTermStore: jest.fn(),
  createDealFolder: jest.fn(),
  createFacilityFolder: jest.fn(),
  uploadSupportingDocuments: jest.fn(),
}));

describe('eStore cron failure-log errors', () => {
  const data: Estore = {
    dealId: '507f1f77bcf86cd799439011',
    siteId: 'site-id',
    exporterName: 'Exporter',
    buyerName: 'Buyer',
    dealIdentifier: 'deal-identifier',
    facilityIdentifiers: [1234567890],
    supportingInformation: [{ documentType: 'pdf', fileName: 'document.pdf', fileLocationPath: 'documents/', parentId: 'parent-id' }],
    destinationMarket: 'GBR',
    riskMarket: 'GBR',
  };
  const error = new Error('Provisioning failed');
  const logError = new Error('Collection unavailable');

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.mocked(addFacilityToTermStore).mockRejectedValue(error);
    jest.mocked(createDealFolder).mockRejectedValue(error);
    jest.mocked(createFacilityFolder).mockRejectedValue(error);
    jest.mocked(uploadSupportingDocuments).mockRejectedValue(error);
    jest.mocked(EstoreRepo.updateByDealId).mockRejectedValue(logError);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    { name: 'term', run: eStoreTermStoreCreationJob, category: ENDPOINT.TERM },
    { name: 'deal', run: eStoreDealDirectoryCreationJob, category: ENDPOINT.DEAL },
    { name: 'facility', run: eStoreFacilityDirectoryCreationJob, category: ENDPOINT.FACILITY },
    { name: 'document', run: eStoreDocumentsCreationJob, category: ENDPOINT.DOCUMENT },
  ])('stops the $name job and logs both errors when recording failure rejects', async ({ run, category }) => {
    await expect(run(data)).resolves.toBeUndefined();

    expect(EstoreRepo.updateByDealId).toHaveBeenCalledTimes(1);
    expect(cron).toHaveBeenCalledWith({ data, category, kill: true });
    expect(console.error).toHaveBeenCalledWith(expect.any(String), data.dealId, logError);
    expect(console.error).toHaveBeenCalledWith(expect.any(String), data.dealId, error);
  });
});
