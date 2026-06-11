const CONSTANTS = require('../../constants');
const api = require('../api');
const { canSendToApimGift, sendFacilitiesToApimGift } = require('../integrations/apim-gift');
const { findOneGefDeal, findOneTfmDeal } = require('./deal.controller');
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
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatedIssuedFacilities } = require('./update-issued-facilities');
const { submitDealAfterUkefIds, submitDealBeforeUkefIds } = require('./deal.submit.controller');

jest.mock('../api', () => ({
  submitDeal: jest.fn(),
  updateDeal: jest.fn(),
  updateDealSnapshot: jest.fn(),
}));

jest.mock('../integrations/apim-gift', () => ({
  canSendToApimGift: jest.fn(),
  sendFacilitiesToApimGift: jest.fn(),
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

const isBssEwcsDeal = false;
const isGefDeal = true;

describe('submitDealAfterUkefIds', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    api.submitDeal.mockResolvedValue(submittedDeal);
    api.updateDeal.mockResolvedValue(tfmDeal);

    addTfmDealData.mockImplementation(async (deal) => deal);
    addPartyUrns.mockImplementation(async (deal) => ({ deal, newPartyUrnCreated: true }));
    addFirstTaskEmailSentFlag.mockReturnValue([{ emailSent: true }]);

    canSubmitToACBS.mockResolvedValue(false);
    canSendToApimGift.mockResolvedValue({ canSendFacilitiesToApimGift: false, issuedFacilities: [] });

    convertDealCurrencies.mockImplementation(async (deal) => deal);
    createEstoreSite.mockImplementation(async (deal) => ({ ...deal, tfm: { tasks: [] } }));
    createDealTasks.mockImplementation(async (deal) => deal);

    findOneGefDeal.mockResolvedValueOnce({ _id: dealId }).mockResolvedValueOnce({ _id: dealId, status: 'Acknowledged' });

    mapSubmittedDeal.mockReturnValue(mappedDeal);

    sendFacilitiesToApimGift.mockResolvedValueOnce(issuedFacilities);
    sendDealSubmitEmails.mockResolvedValue({ firstTaskEmail: { to: 'test@example.com' } });

    updateFacilities.mockImplementation(async (deal) => deal);
    updatePortalDealStatus.mockResolvedValue();
  });

  describe('first submission', () => {
    it('should call updatePortalDealStatus', async () => {
      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(updatePortalDealStatus).toHaveBeenNthCalledWith(1, mappedDeal, auditDetails);
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

    it('should call canSendToApimGift', async () => {
      // Arrange
      canSendToApimGift.mockResolvedValue({
        canSendFacilitiesToApimGift: true,
        issuedFacilities,
        isBssEwcsDeal,
        isGefDeal,
      });

      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(canSendToApimGift).toHaveBeenCalledWith(tfmDeal);
    });

    describe('when APIM/GIFT submission is allowed', () => {
      it('should call sendFacilitiesToApimGift with newPartyUrnCreated true when addPartyUrns returns true', async () => {
        // Arrange
        canSendToApimGift.mockResolvedValue({
          canSendFacilitiesToApimGift: true,
          issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Act
        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        // Assert
        expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(1, {
          deal: tfmDeal,
          facilities: issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
          newPartyUrnCreated: true,
        });
      });

      it('should call sendFacilitiesToApimGift with newPartyUrnCreated false when addPartyUrns returns false', async () => {
        // Arrange
        addPartyUrns.mockImplementationOnce(async (deal) => ({ deal, newPartyUrnCreated: false }));
        canSendToApimGift.mockResolvedValue({
          canSendFacilitiesToApimGift: true,
          issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Act
        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        // Assert
        expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(1, {
          deal: tfmDeal,
          facilities: issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
          newPartyUrnCreated: false,
        });
      });

      it('should call sendFacilitiesToApimGift when addPartyUrns does not return a deal', async () => {
        // Arrange
        addPartyUrns.mockResolvedValueOnce(false);
        canSendToApimGift.mockResolvedValue({
          canSendFacilitiesToApimGift: true,
          issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Act
        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        // Assert
        expect(sendFacilitiesToApimGift).toHaveBeenNthCalledWith(1, {
          deal: tfmDeal,
          facilities: issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
          newPartyUrnCreated: undefined,
        });
      });
    });

    describe('when APIM/GIFT submission is not allowed', () => {
      it('should NOT call sendFacilitiesToApimGift', async () => {
        // Arrange
        canSendToApimGift.mockResolvedValue({
          canSendFacilitiesToApimGift: false,
          issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Act
        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        // Assert
        expect(sendFacilitiesToApimGift).not.toHaveBeenCalled();
      });
    });
  });

  describe('deal resubmission', () => {
    const resubmittedDeal = { ...mappedDeal, submissionCount: 2 };
    const existingTfmDeal = { _id: dealId, tfm: { stage: 'stage', tasks: [] } };

    beforeEach(() => {
      jest.clearAllMocks();

      api.submitDeal.mockResolvedValue(submittedDeal);
      api.updateDeal.mockResolvedValue(tfmDeal);
      api.updateDealSnapshot.mockResolvedValue({ dealSnapshot: submittedDeal });

      mapSubmittedDeal.mockReturnValue(resubmittedDeal);
      findOneTfmDeal.mockResolvedValue(existingTfmDeal);
      findOneGefDeal.mockResolvedValue({ _id: dealId, status: 'Acknowledged' });

      shouldUpdateDealFromMIAtoMIN.mockReturnValue(false);
      updatedIssuedFacilities.mockImplementation(async (deal) => deal);
      updatePortalDealStatus.mockResolvedValue();

      canSubmitToACBS.mockResolvedValue(false);
      canSendToApimGift.mockResolvedValue({ canSendFacilitiesToApimGift: false, issuedFacilities: [] });
    });

    it('should call canSendToApimGift with the updated tfmDeal', async () => {
      // Arrange
      canSendToApimGift.mockResolvedValue({
        canSendFacilitiesToApimGift: true,
        issuedFacilities,
        isBssEwcsDeal,
        isGefDeal,
      });

      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(canSendToApimGift).toHaveBeenCalledWith(tfmDeal);
    });

    describe('when APIM/GIFT submission is allowed', () => {
      it('should call sendFacilitiesToApimGift with correct parameters', async () => {
        // Arrange
        canSendToApimGift.mockResolvedValue({
          canSendFacilitiesToApimGift: true,
          issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });

        // Act
        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        // Assert
        expect(sendFacilitiesToApimGift).toHaveBeenCalledWith({
          deal: tfmDeal,
          facilities: issuedFacilities,
          isBssEwcsDeal,
          isGefDeal,
        });
      });
    });

    describe('when APIM/GIFT submission is not allowed', () => {
      it('should NOT call sendFacilitiesToApimGift', async () => {
        // Arrange
        canSendToApimGift.mockResolvedValue({
          canSendFacilitiesToApimGift: false,
          issuedFacilities: [],
          isBssEwcsDeal,
          isGefDeal,
        });

        // Act
        await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

        // Assert
        expect(sendFacilitiesToApimGift).not.toHaveBeenCalled();
      });
    });

    it('should return the updated TFM deal', async () => {
      // Act
      await submitDealAfterUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

      // Assert
      expect(api.updateDeal).toHaveBeenCalled();
    });
  });
});

describe('submitDealBeforeUkefIds', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    api.submitDeal.mockResolvedValue(submittedDeal);
    api.updateDeal.mockResolvedValue(tfmDeal);

    addTfmDealData.mockImplementation(async (deal) => deal);
    addPartyUrns.mockImplementation(async (deal) => ({ deal, newPartyUrnCreated: true }));
    addFirstTaskEmailSentFlag.mockReturnValue([{ emailSent: true }]);

    canSubmitToACBS.mockResolvedValue(false);
    canSendToApimGift.mockResolvedValue({ canSubmitFacilitiesToApimGift: false, issuedFacilities: [] });

    convertDealCurrencies.mockImplementation(async (deal) => deal);
    createEstoreSite.mockImplementation(async (deal) => ({ ...deal, tfm: { tasks: [] } }));
    createDealTasks.mockImplementation(async (deal) => deal);

    findOneGefDeal.mockResolvedValueOnce({ _id: dealId }).mockResolvedValueOnce({ _id: dealId, status: 'Acknowledged' });

    mapSubmittedDeal.mockReturnValue(mappedDeal);

    sendDealSubmitEmails.mockResolvedValue({ firstTaskEmail: { to: 'test@example.com' } });

    updateFacilities.mockImplementation(async (deal) => deal);
    updatePortalDealStatus.mockResolvedValue();
  });

  it('should submit the deal to central API once', async () => {
    await submitDealBeforeUkefIds(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker, auditDetails);

    expect(api.submitDeal).toHaveBeenCalledTimes(1);
  });
});
