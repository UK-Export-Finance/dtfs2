const acbsController = require('../../../src/v1/controllers/acbs.controller');
const { clearACBSLog } = require('../../helpers/clear-acbs-log');
const api = require('../../../src/v1/api');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_ACBS = require('../../../src/v1/__mocks__/mock-deal-acbs');
const CONSTANTS = require('../../../src/constants');

jest.mock('../../../src/v1/controllers/banks.controller', () => ({
  findOneBank: (mockBankId) => (mockBankId === '123' ? false : { id: mockBankId }),
}));

const MOCK_TFM_DEAL_ACBS = {
  dealSnapshot: MOCK_DEAL_ACBS,
  tfm: {
    acbs: {
      facilityStage: 'Unissued',
      hasBeenIssued: false,
    },
  },
};

describe('acbs controller', () => {
  beforeAll(async () => {
    await clearACBSLog();
  });

  afterEach(async () => {
    await clearACBSLog();
  });

  describe('addToACBSLog', () => {
    it('should not add an entry to `durable-functions-log` if the payload is malformed', async () => {
      const result = await acbsController.addToACBSLog({ deal: { deal: '123' }, acbsTaskLinks: {} });

      expect(result).toEqual(false);
    });

    it('should not add an entry to `durable-functions-log` if the payload is malformed', async () => {
      const result = await acbsController.addToACBSLog({ deal: { _id: 'invalid' }, acbsTaskLinks: { id: '123' } });

      expect(result).toEqual(false);
    });

    it('should not add an entry to `durable-functions-log` if the payload is malformed', async () => {
      const result = await acbsController.addToACBSLog({
        deal: { _id: '64da2f74de0f97235921b09b' },
        acbsTaskLinks: { statusQueryGetUri: '' },
      });

      expect(result).toEqual(false);
    });

    it('should add entry to acbs log', async () => {
      const result = await acbsController.addToACBSLog({
        deal: { _id: '64da2f74de0f97235921b09b' },
        acbsTaskLinks: { id: '123' },
      });
      expect(result).toEqual({
        acknowledged: true,
        insertedId: expect.any(Object),
      });
    });
  });

  describe('createACBS', () => {
    it('should return false if deal if no banks exists', async () => {
      const result = await acbsController.createACBS({
        dealSnapshot: {
          ...MOCK_DEAL,
          bank: null,
        },
      });
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

    it('should not update facility in ACBS if facility is already issued', async () => {
      const mockDeal = {
        exporter: { companyName: 'test' },
        facilities: [
          {
            facilityStage: 'Issued',
            hasBeenIssued: true,
            tfm: {
              acbs: {
                facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED,
              },
            },
          },
        ],
        tfm: {
          acbs: {},
        },
      };
      await acbsController.issueAcbsFacilities(mockDeal);
      expect(api.updateACBSfacility).not.toHaveBeenCalled();
    });

    it('should not update facility in ACBS if facility is risk expired', async () => {
      const mockDeal = {
        exporter: { companyName: 'test' },
        facilities: [
          {
            facilityStage: 'Issued',
            hasBeenIssued: true,
            tfm: {
              acbs: {
                facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.RISK_EXPIRED,
              },
            },
          },
        ],
        tfm: {
          acbs: {},
        },
      };
      await acbsController.issueAcbsFacilities(mockDeal);
      expect(api.updateACBSfacility).not.toHaveBeenCalled();
    });

    it('should call updateACBSfacility ACBS function', async () => {
      const mockDeal = {
        exporter: { companyName: 'test' },
        facilities: [
          {
            facilityStage: 'Issued',
            hasBeenIssued: true,
            tfm: {
              acbs: {
                facilityStage: CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.COMMITMENT,
              },
            },
          },
        ],
        tfm: {
          acbs: {},
        },
      };
      await acbsController.issueAcbsFacilities(mockDeal);
      expect(api.updateACBSfacility).toHaveBeenCalled();
    });
  });

  describe('checkAzureAcbsFunction', () => {
    it('should not do anything if nothing in acbs log to process', async () => {
      await acbsController.checkAzureAcbsFunction();
      expect(api.getFunctionsAPI).not.toHaveBeenCalled();
    });

    it('should update any azure deal tasks in acbs log', async () => {
      await acbsController.addToACBSLog({
        deal: { _id: '64da2f74de0f97235921b09b' },
        acbsTaskLinks: { id: '123', statusQueryGetUri: 'mock.url' },
      });
      await acbsController.checkAzureAcbsFunction();
      expect(api.getFunctionsAPI).toHaveBeenCalledWith('mock.url');
    });

    it('should update any azure issue facility tasks in acbs log', async () => {
      await acbsController.addToACBSLog({
        deal: { _id: '64da2f74de0f97235921b09b' },
        acbsTaskLinks: { id: '123', statusQueryGetUri: 'acbs-issue-facility' },
      });
      await acbsController.checkAzureAcbsFunction();
      expect(api.getFunctionsAPI).toHaveBeenCalledWith('acbs-issue-facility');
    });
  });
});
