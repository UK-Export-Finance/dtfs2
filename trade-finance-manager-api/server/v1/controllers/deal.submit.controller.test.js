const CONSTANTS = require('../../constants');

jest.mock('../api', () => ({
  submitDeal: jest.fn(),
  updateDeal: jest.fn(),
  updateDealSnapshot: jest.fn(),
}));

jest.mock('../integrations/apim-gift', () => ({
  canSubmitToApimGift: jest.fn(),
  submitFacilitiesToApimGift: jest.fn(),
}));

jest.mock('./deal.controller', () => ({
  findOneTfmDeal: jest.fn(),
  findOnePortalDeal: jest.fn(),
  findOneGefDeal: jest.fn(),
}));

jest.mock('./deal.party-db', () => ({
  addPartyUrns: jest.fn(),
}));

jest.mock('./deal.tasks', () => ({
  createDealTasks: jest.fn(),
}));

jest.mock('./deal-add-tfm-data/add-first-task-email-sent-flag', () => jest.fn());

jest.mock('./update-facilities', () => ({
  updateFacilities: jest.fn(),
}));

jest.mock('./deal.convert-deal-currencies', () => ({
  convertDealCurrencies: jest.fn(),
}));

jest.mock('./deal-add-tfm-data', () => jest.fn());
jest.mock('./deal-add-tfm-data/dealStage', () => jest.fn());

jest.mock('./update-issued-facilities', () => ({
  updatedIssuedFacilities: jest.fn(),
}));

jest.mock('./update-portal-deal-status', () => ({
  updatePortalDealStatus: jest.fn(),
}));

jest.mock('./estore.controller', () => ({
  createEstoreSite: jest.fn(),
}));

jest.mock('./acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
  createACBS: jest.fn(),
}));

jest.mock('./should-update-deal-from-MIA-to-MIN', () => ({
  shouldUpdateDealFromMIAtoMIN: jest.fn(),
}));

jest.mock('./update-portal-deal-from-MIA-to-MIN', () => ({
  updatePortalDealFromMIAtoMIN: jest.fn(),
}));

jest.mock('./send-deal-submit-emails', () => ({
  sendDealSubmitEmails: jest.fn(),
  sendAinMinAcknowledgement: jest.fn(),
}));

jest.mock('../mappings/map-submitted-deal', () => jest.fn());
jest.mock('../helpers/dealHasAllUkefIds', () => ({ dealHasAllUkefIds: jest.fn() }));
jest.mock('../helpers/can-submit-to-acbs', () => jest.fn());

const api = require('../api');
const { canSubmitToApimGift, submitFacilitiesToApimGift } = require('../integrations/apim-gift');
const { findOneGefDeal } = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const addFirstTaskEmailSentFlag = require('./deal-add-tfm-data/add-first-task-email-sent-flag');
const { updateFacilities } = require('./update-facilities');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');
const addTfmDealData = require('./deal-add-tfm-data');
const { updatePortalDealStatus } = require('./update-portal-deal-status');
const { createEstoreSite } = require('./estore.controller');
const { sendDealSubmitEmails } = require('./send-deal-submit-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const canSubmitToACBS = require('../helpers/can-submit-to-acbs');

const { submitDealAfterUkefIds } = require('./deal.submit.controller');

const dealId = 'deal-123';
const checker = { _id: 'checker-id' };
const auditDetails = { user: 'checker-id' };

const submittedDeal = { _id: dealId };
const mappedDeal = {
  _id: dealId,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  submissionCount: 1,
};
const issuedFacilities = [{ _id: 'facility-1' }];
const tfmDeal = { _id: dealId, tfm: { stage: 'stage' } };

describe('submitDealAfterUkefIds', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    api.submitDeal.mockResolvedValue(submittedDeal);
    api.updateDeal.mockResolvedValue(tfmDeal);

    addTfmDealData.mockImplementation(async (deal) => deal);
    addPartyUrns.mockImplementation(async (deal) => deal);
    addFirstTaskEmailSentFlag.mockReturnValue([{ emailSent: true }]);

    canSubmitToACBS.mockResolvedValue(false);
    canSubmitToApimGift.mockResolvedValue({
      canSubmitFacilitiesToApimGift: true,
      issuedFacilities,
    });
    canSubmitToApimGift.mockResolvedValue({ canSubmitFacilitiesToApimGift: false, issuedFacilities: [] });
    convertDealCurrencies.mockImplementation(async (deal) => deal);
    createEstoreSite.mockImplementation(async (deal) => ({ ...deal, tfm: { tasks: [] } }));
    createDealTasks.mockImplementation(async (deal) => deal);

    findOneGefDeal.mockResolvedValueOnce({ _id: dealId }).mockResolvedValueOnce({ _id: dealId, status: 'Acknowledged' });

    mapSubmittedDeal.mockReturnValue(mappedDeal);

    submitFacilitiesToApimGift.mockResolvedValueOnce(issuedFacilities);
    sendDealSubmitEmails.mockResolvedValue({ firstTaskEmail: { to: 'test@example.com' } });

    updateFacilities.mockImplementation(async (deal) => deal);
    updatePortalDealStatus.mockResolvedValue();
  });

  describe('first submission', () => {
    it('should call updatePortalDealStatus', async () => {
      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(updatePortalDealStatus).toHaveBeenCalledTimes(1);
      expect(updatePortalDealStatus).toHaveBeenCalledWith(mappedDeal, auditDetails);
    });

    it('should call createDealTasks', async () => {
      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(createDealTasks).toHaveBeenCalledTimes(1);
    });

    it('should call api.updateDeal', async () => {
      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(api.updateDeal).toHaveBeenCalledTimes(1);
    });

    it('should return a TFM deal', async () => {
      // Act
      const result = await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(result).toEqual(tfmDeal);
    });

    it('should call canSubmitToApimGift', async () => {
      canSubmitToApimGift.mockResolvedValue({
        canSubmitFacilitiesToApimGift: true,
      });

      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      expect(canSubmitToApimGift).toHaveBeenCalledWith(tfmDeal);
    });

    describe('when APIM/GIFT submission is allowed', () => {
      it('should call submitFacilitiesToApimGift when APIM/GIFT submission is allowed', async () => {
        canSubmitToApimGift.mockResolvedValue({
          canSubmitFacilitiesToApimGift: true,
          issuedFacilities,
        });

        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        expect(submitFacilitiesToApimGift).toHaveBeenCalledTimes(1);
        expect(submitFacilitiesToApimGift).toHaveBeenCalledWith({
          deal: tfmDeal,
          facilities: issuedFacilities,
        });
      });
    });

    describe('when APIM/GIFT submission is not allowed', () => {
      it('should NOT call submitFacilitiesToApimGift', async () => {
        canSubmitToApimGift.mockResolvedValue({
          canSubmitFacilitiesToApimGift: false,
          issuedFacilities,
        });

        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        expect(submitFacilitiesToApimGift).not.toHaveBeenCalled();
      });
    });
  });
});
