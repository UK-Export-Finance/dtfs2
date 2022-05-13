import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';
import amendmentBanksDecisionController from '.';

import MOCKS from '../test-mocks/amendment-test-mocks';

const res = mockRes();

describe('GET getAmendmentBankDecision()', () => {
  it('it should return an object with the correct parameters and with false userCanEdit when decision set and not PIM', async () => {
    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      MOCKS.MOCK_DEAL,
      MOCKS.MOCK_AMENDMENT,
      MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    );

    expect(result).toEqual({
      userCanEdit: false,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: MOCKS.MOCK_DEAL.dealSnapshot,
      tfm: MOCKS.MOCK_DEAL.tfm,
      dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
      user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
      amendment: MOCKS.MOCK_AMENDMENT,
    });
  });

  it('it should return an object with false userCanEdit when no bank decision set and PIM', async () => {
    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      MOCKS.MOCK_DEAL,
      MOCKS.MOCK_AMENDMENT,
      MOCKS.MOCK_USER_PIM,
    );

    expect(result).toEqual({
      userCanEdit: false,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: MOCKS.MOCK_DEAL.dealSnapshot,
      tfm: MOCKS.MOCK_DEAL.tfm,
      dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
      user: MOCKS.MOCK_USER_PIM,
      amendment: MOCKS.MOCK_AMENDMENT,
    });
  });

  it('it should return an object with true userCanEdit when bank decision is set and PIM', async () => {
    const result = await amendmentBanksDecisionController.getAmendmentBankDecision(
      MOCKS.MOCK_DEAL,
      MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION,
      MOCKS.MOCK_USER_PIM,
    );

    expect(result).toEqual({
      userCanEdit: true,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: MOCKS.MOCK_DEAL.dealSnapshot,
      tfm: MOCKS.MOCK_DEAL.tfm,
      dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
      user: MOCKS.MOCK_USER_PIM,
      amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION,
    });
  });
});

describe('GET getBanksDecisionEdit()', () => {
  describe('When underwriter decision is available and user is a PIM user', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('it should render the template with correct parameters', async () => {
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

      expect(res.render).toHaveBeenCalledWith('case/underwriting/amendments/amendment-banks-decision/amendment-edit-banks-decision.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: MOCKS.MOCK_DEAL.dealSnapshot,
        tfm: MOCKS.MOCK_DEAL.tfm,
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        user: MOCKS.MOCK_USER_PIM,
        amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION.amendments,
      });
    });
  });

  describe('When underwriter decision is available and user is not a PIM user', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('it should redirect to not-found', async () => {
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

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('When underwriter decision is not available and user is a PIM user', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
    });

    it('it should redirect to not-found', async () => {
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

  describe('When deal or amendments not found', () => {
    describe('When deal not found', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
      });

      it('it should redirect to not-found', async () => {
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

      it('it should redirect to not-found', async () => {
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
