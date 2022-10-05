import { getUnixTime, set } from 'date-fns';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import amendmentsController from './bankDecision.controller';
import MOCKS from '../../../test-mocks/amendment-test-mocks';
import CONSTANTS from '../../../constants';

const res = mockRes();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['PIM'],
  email: 'test@localhost',
};

const session = { user };

describe('GET getAmendmentBankDecisionChoice', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should render template when amendment is found with isEditable true when PIM user', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionChoice(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED,
        isEditable: true,
        user,
      });
    });

    it('should render template when amendment is found with isEditable false when underwriter user and ukefDecision not submitted', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED_NOT_SUBMITTED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED_NOT_SUBMITTED.amendmentId,
          facilityId: '12345',
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      };
      await amendmentsController.getAmendmentBankDecisionChoice(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED_NOT_SUBMITTED,
        isEditable: false,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
      });
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionChoice(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST postAmendmentBankDecisionChoice', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to received date page when no errors', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });
      api.updateAmendment = () => Promise.resolve({ status: 200 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        body: {
          banksDecision: CONSTANTS.AMENDMENTS.AMENDMENT_BANK_DECISION.PROCEED,
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionChoice(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/facility/${req.params.facilityId}/amendment/${req.params.amendmentId}/banks-decision/received-date`);
    });

    it('should render template with errors if no decision provided in body', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        body: { banksDecision: null },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionChoice(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED,
        isEditable: true,
        user,
        errors: {
          errorSummary: [
            {
              text: 'Select if the bank wants to proceed or withdraw',
              href: '#banksDecision',
            },
          ],
          fieldErrors: {
            banksDecision: { text: 'Select if the bank wants to proceed or withdraw' },
          },
        },
      });
    });

    it('should redirect to underwriting page if error updating amendment', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });
      api.updateAmendment = () => Promise.resolve({ status: 400 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        body: {
          banksDecision: CONSTANTS.AMENDMENTS.AMENDMENT_BANK_DECISION.PROCEED,
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionChoice(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/underwriting`);
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      jest.resetAllMocks();
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        body: {
          banksDecision: CONSTANTS.AMENDMENTS.AMENDMENT_BANK_DECISION.PROCEED,
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionChoice(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('GET getAmendmentBankDecisionReceivedDate', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should render template when amendment is found with isEditable true when PIM user and bank decision present', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionReceivedDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-receive-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION,
        isEditable: true,
        user,
        bankDecisionDateDay: '',
        bankDecisionDateMonth: '',
        bankDecisionDateYear: '',
      });
    });

    it('should render template when amendment is found with dates when they exist on ammendment and when bank decision present', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionReceivedDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-receive-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES,
        isEditable: true,
        user,
        bankDecisionDateDay: '08',
        bankDecisionDateMonth: '06',
        bankDecisionDateYear: '2022',
      });
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('should redirect to not found when amendment does not have bank decision', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST postAmendmentBankDecisionReceivedDate', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to effective date page when no errors and banks decision is proceed', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION });
      api.updateAmendment = () => Promise.resolve({ status: 200 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/facility/${req.params.facilityId}/amendment/${req.params.amendmentId}/banks-decision/effective-date`);
    });

    it('should redirect to check answers page when no errors and bank decision is declined', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITHDRAW });
      api.updateAmendment = () => Promise.resolve({ status: 200 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITHDRAW.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/facility/${req.params.facilityId}/amendment/${req.params.amendmentId}/banks-decision/check-answers`);
    });

    it('should redirect to check answers page when no errors and bank decision is declined and removes effective date if exists', async () => {
      const apiUpdateSpy = jest.fn(() => Promise.resolve({
        status: 200,
      }));
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITHDRAW_EFFECTIVE_DATE });
      api.updateAmendment = apiUpdateSpy;

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITHDRAW_EFFECTIVE_DATE.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      const expectedUpdateObj = {
        bankDecision: {
          receivedDate: getUnixTime(set(new Date(), {
            year: '2022',
            month: '06' - 1,
            date: '08',
          })),
          effectiveDate: null,
        },
      };

      expect(apiUpdateSpy).toHaveBeenCalledWith(
        req.params.facilityId,
        req.params.amendmentId,
        expectedUpdateObj,
      );
    });

    it('should render template with errors if no date provided in body', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '',
          'amendment--bank-decision-date-month': '',
          'amendment--bank-decision-date-year': '',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-receive-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION,
        isEditable: true,
        user,
        errors: {
          errorSummary: [
            {
              text: 'Enter the date UKEF received the bank\'s decision',
              href: '#bankDecisionDate',
            },
          ],
          fieldErrors: {
            bankDecisionDate: { text: 'Enter the date UKEF received the bank\'s decision' },
          },
        },
        bankDecisionDateDay: '',
        bankDecisionDateMonth: '',
        bankDecisionDateYear: '',
      });
    });

    it('should render template with errors if partial date provided in body', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-receive-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION,
        isEditable: true,
        user,
        errors: {
          errorSummary: [
            {
              text: 'Enter the date UKEF received the bank\'s decision',
              href: '#bankDecisionDate',
            },
          ],
          fieldErrors: {
            bankDecisionDate: { text: 'Enter the date UKEF received the bank\'s decision' },
          },
        },
        bankDecisionDateDay: '08',
        bankDecisionDateMonth: '',
        bankDecisionDateYear: '2022',
      });
    });

    it('should redirect to underwriting page if error updating amendment', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION });
      api.updateAmendment = () => Promise.resolve({ status: 400 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/underwriting`);
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      jest.resetAllMocks();
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('should redirect to not found when amendment does not have bank decision', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };
      await amendmentsController.postAmendmentBankDecisionReceivedDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('GET getAmendmentBankDecisionEffectiveDate', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should render template when amendment is found with isEditable true when PIM user and bank decision present and received dates present', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-effective-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES,
        isEditable: true,
        user,
        bankDecisionDateDay: '',
        bankDecisionDateMonth: '',
        bankDecisionDateYear: '',
      });
    });

    it('should render template when amendment is found with effective date when they exist on ammendment and when bank decision present and received dates present', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-effective-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES,
        isEditable: true,
        user,
        bankDecisionDateDay: '08',
        bankDecisionDateMonth: '06',
        bankDecisionDateYear: '2022',
      });
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('should redirect to not found when amendment does not have bank decision', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST postAmendmentBankDecisionEffectiveDate', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to check answers page when no errors', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });
      api.updateAmendment = () => Promise.resolve({ status: 200 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/facility/${req.params.facilityId}/amendment/${req.params.amendmentId}/banks-decision/check-answers`);
    });

    it('should render template with errors if no date provided in body', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '',
          'amendment--bank-decision-date-month': '',
          'amendment--bank-decision-date-year': '',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-effective-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES,
        isEditable: true,
        user,
        errors: {
          errorSummary: [
            {
              text: 'Enter the date the amendment will be effective from',
              href: '#bankDecisionDate',
            },
          ],
          fieldErrors: {
            bankDecisionDate: { text: 'Enter the date the amendment will be effective from' },
          },
        },
        bankDecisionDateDay: '',
        bankDecisionDateMonth: '',
        bankDecisionDateYear: '',
      });
    });

    it('should render template with errors if partial date provided in body', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-effective-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES,
        isEditable: true,
        user,
        errors: {
          errorSummary: [
            {
              text: 'Enter the date the amendment will be effective from',
              href: '#bankDecisionDate',
            },
          ],
          fieldErrors: {
            bankDecisionDate: { text: 'Enter the date the amendment will be effective from' },
          },
        },
        bankDecisionDateDay: '08',
        bankDecisionDateMonth: '',
        bankDecisionDateYear: '2022',
      });
    });

    it('should redirect to underwriting page if error updating amendment', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });
      api.updateAmendment = () => Promise.resolve({ status: 400 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/underwriting`);
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      jest.resetAllMocks();
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('should redirect to not found when amendment does not have bank decision', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        body: {
          'amendment--bank-decision-date-day': '08',
          'amendment--bank-decision-date-month': '06',
          'amendment--bank-decision-date-year': '2022',
        },
        session,
      };
      await amendmentsController.postAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('GET getAmendmentBankDecisionAnswers', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should render template when amendment is found with effective and received dates in correct format', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionAnswers(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-check-answers.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES,
        isEditable: true,
        user,
        decision: CONSTANTS.AMENDMENTS.AMENDMENT_BANK_DECISION.PROCEED,
        receivedDate: '08 Jun 2022',
        effectiveDate: '08 Jun 2022',
      });
    });

    it('should render template when amendment is found with received date in correct format', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionAnswers(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-banks-decision-check-answers.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES,
        isEditable: true,
        user,
        decision: CONSTANTS.AMENDMENTS.AMENDMENT_BANK_DECISION.PROCEED,
        receivedDate: '08 Jun 2022',
        effectiveDate: '',
      });
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionAnswers(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('should redirect to not found when amendment does not have bank decision', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.getAmendmentBankDecisionEffectiveDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST postAmendmentBankDecisionAnswers', () => {
  describe('an existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to underwriting page when no errors', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES });
      api.updateAmendment = () => Promise.resolve({ status: 200 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_EFFECTIVE_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionAnswers(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/underwriting`);
    });

    it('should redirect to underwriting page if error updating amendment', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES });
      api.updateAmendment = () => Promise.resolve({ status: 400 });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_BANK_DECISION_WITH_DATES.amendmentId,
          facilityId: '12345',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionAnswers(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${req.params._id}/underwriting`);
    });
  });

  describe('no existing amendment', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect to not found when amendment not found', async () => {
      jest.resetAllMocks();
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: {} });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: '1',
          facilityId: '12345',
        },
        session,
      };

      await amendmentsController.postAmendmentBankDecisionAnswers(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('should redirect to not found when amendment does not have bank decision', async () => {
      api.getAmendmentById = () => Promise.resolve({ status: 200, data: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED });

      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_TWO_AMENDMENTS_ONE_DECLINED.amendmentId,
          facilityId: '12345',
        },
        session,
      };
      await amendmentsController.postAmendmentBankDecisionAnswers(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
