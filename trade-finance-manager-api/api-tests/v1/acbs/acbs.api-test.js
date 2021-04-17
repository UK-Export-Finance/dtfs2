const acbsController = require('../../../src/v1/controllers/acbs.controller');
const api = require('../../../src/v1/api');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_ACBS = require('../../../src/v1/__mocks__/mock-deal-acbs');

const MOCK_TFM_DEAL_ACBS = {
  dealSnapshot: MOCK_DEAL_ACBS,
  tfm: {
    acbs: {
      facilityStage: 'Unissued',
    },
  },
};

describe('acbs controller', () => {
  beforeAll(async () => {
    await acbsController.clearACBSLog();
  });

  afterEach(async () => {
    await acbsController.clearACBSLog();
  });

  describe('addToACBSLog', () => {
    it('should add entry to acbs log', async () => {
      const { result } = await acbsController.addToACBSLog({ deal: { _id: '12345' }, acbsTaskLinks: {} });
      expect(result.n).toEqual(1);
      expect(result.ok).toEqual(1);
    });
  });

  describe('clearACBSLog', () => {
    it('should clear acbs log', async () => {
      await acbsController.addToACBSLog({ deal: { _id: '12345' }, acbsTaskLinks: {} });
      const { result } = await acbsController.clearACBSLog();
      expect(result.n).toEqual(1);
      expect(result.ok).toEqual(1);
    });
  });

  describe('createACBS', () => {
    it('should return false if deal if bankID not recognised', async () => {
      const result = await acbsController.createACBS({ dealSnapshot: MOCK_DEAL });
      expect(result).toEqual(false);
      expect(api.createACBS).not.toHaveBeenCalled();
    });

    it('should call createACBS ACBS function', async () => {
      await acbsController.createACBS(MOCK_TFM_DEAL_ACBS);
      expect(api.createACBS).toHaveBeenCalled();
    });
  });

  describe('issueAcbsFacilities', () => {
    it('should return false if no tfm object exists', async () => {
      const result = await acbsController.issueAcbsFacilities({ dealSnapshot: {} });
      expect(result).toEqual(false);
    });

    it('should return false if no tfm.acbs object exists', async () => {
      const result = await acbsController.issueAcbsFacilities({ dealSnapshot: {}, tfm: {} });
      expect(result).toEqual(false);
    });

    it('should call updateACBSfacility ACBS function', async () => {
      await acbsController.issueAcbsFacilities(MOCK_TFM_DEAL_ACBS);
      expect(api.updateACBSfacility).toHaveBeenCalled();
    });
  });

  describe('checkAzureAcbsFunction', () => {
    it('should not do anything if nothing in acbs log to process', async () => {
      await acbsController.checkAzureAcbsFunction();
      expect(api.getFunctionsAPI).not.toHaveBeenCalled();
    });

    it('should update any azure deal tasks in acbs log', async () => {
      await acbsController.addToACBSLog({ deal: { _id: '12345' }, acbsTaskLinks: { statusQueryGetUri: 'mock.url' } });
      await acbsController.checkAzureAcbsFunction();
      expect(api.getFunctionsAPI).toHaveBeenCalledWith('mock.url');
    });

    it('should update any azure issue facility tasks in acbs log', async () => {
      await acbsController.addToACBSLog({ deal: { _id: '12345' }, acbsTaskLinks: { statusQueryGetUri: 'acbs-issue-facility' } });
      await acbsController.checkAzureAcbsFunction();
      expect(api.getFunctionsAPI).toHaveBeenCalledWith('acbs-issue-facility');
    });
  });
});
