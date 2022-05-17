import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';
import amendmentBanksDecisionController from '.';

import MOCKS from '../test-mocks/amendment-test-mocks';

const res = mockRes();

describe('GET getAmendmentBankDecision()', () => {
  it('should return an object with the correct parameters and with false userCanEdit when decision set and not PIM', async () => {
    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      MOCKS.MOCK_AMENDMENT_BY_PROGRESS,
      MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    );

    expect(result).toEqual({
      isEditable: false,
      amendment: MOCKS.MOCK_AMENDMENT_BY_PROGRESS,
      dealId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.dealId,
      facilityId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.amendmentId,
      underwriterManagersDecision: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.underwriterManagersDecision,
      banksDecision: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.banksDecision,
    });
  });

  it('should return an object with false userCanEdit when no bank decision set and PIM', async () => {
    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      MOCKS.MOCK_AMENDMENT_BY_PROGRESS,
      MOCKS.MOCK_USER_PIM,
    );

    expect(result).toEqual({
      isEditable: false,
      amendment: MOCKS.MOCK_AMENDMENT_BY_PROGRESS,
      dealId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.dealId,
      facilityId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.amendmentId,
      underwriterManagersDecision: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.underwriterManagersDecision,
      banksDecision: MOCKS.MOCK_AMENDMENT_BY_PROGRESS.banksDecision,
    });
  });

  it('should return an object with true userCanEdit when bank decision is set and PIM', async () => {
    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS,
      MOCKS.MOCK_USER_PIM,
    );

    expect(result).toEqual({
      isEditable: true,
      amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS,
      dealId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS.dealId,
      facilityId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS.amendmentId,
      underwriterManagersDecision: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS.underwriterManagersDecision,
      banksDecision: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_BY_PROGRESS.banksDecision,
    });
  });
});

describe('GET getBanksDecisionEdit()', () => {
  describe('When underwriter decision is available and user is a PIM user', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('should render the template with correct parameters', async () => {
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments.amendmentId,
          facilityId: '12345',
        },
        session: MOCKS.sessionPIMUser,
      };

      await amendmentBanksDecisionController.getBanksDecisionEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/underwriting/amendment-banks-decision/amendment-edit-banks-decision.njk', {
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments,
        isEditable: true,
        user: MOCKS.MOCK_USER_PIM,
      });
    });
  });

  describe('When underwriter decision is available and user is not a PIM user', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('should render the template with userCanEdit as false', async () => {
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments.amendmentId,
          facilityId: '12345',
        },
        session: MOCKS.session,
      };

      await amendmentBanksDecisionController.getBanksDecisionEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/underwriting/amendment-banks-decision/amendment-edit-banks-decision.njk', {
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments,
        isEditable: false,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
      });
    });
  });

  describe('When underwriter decision is not available and user is a PIM user', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('should render the template with userCanEdit as false', async () => {
      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '12345',
        },
        session: MOCKS.sessionPIMUser,
      };

      await amendmentBanksDecisionController.getBanksDecisionEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/underwriting/amendment-banks-decision/amendment-edit-banks-decision.njk', {
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        amendment: MOCKS.MOCK_AMENDMENT.amendments,
        isEditable: false,
        user: MOCKS.MOCK_USER_PIM,
      });
    });
  });

  describe('When deal or amendments not found', () => {
    describe('When deal not found', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
      });

      it('should redirect to not-found', async () => {
        const req = {
          params: {
            _id: MOCKS.MOCK_DEAL._id,
            amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
            facilityId: '12345',
          },
          session: MOCKS.sessionPIMUser,
        };

        await amendmentBanksDecisionController.getBanksDecisionEdit(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('When amendment not found', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
        api.getAmendmentById = () => Promise.resolve({ data: {} });
      });

      it('should redirect to not-found', async () => {
        const req = {
          params: {
            _id: MOCKS.MOCK_DEAL._id,
            amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
            facilityId: '12345',
          },
          session: MOCKS.sessionPIMUser,
        };

        await amendmentBanksDecisionController.getBanksDecisionEdit(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });
});
