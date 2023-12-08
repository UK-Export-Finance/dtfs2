import amendmentUnderwritersDecision from '.';
import api from '../../../api';
import { TEAM_IDS } from '../../../constants';
import { mockRes } from '../../../test-mocks';
import MOCKS from '../../../test-mocks/amendment-test-mocks';

const res = mockRes();

describe('getAmendmentAddUnderwriterManagersDecisionCoverEndDate()', () => {
  it('should render template with data if user can edit decision', async () => {
    api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
    api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, status: 200 });
    const req = {
      params: {
        _id: MOCKS.MOCK_DEAL._id,
        amendmentId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED.amendmentId,
        facilityId: '12345',
      },
      session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
    };

    await amendmentUnderwritersDecision.getAmendmentAddUnderwriterManagersDecisionCoverEndDate(req, res);

    expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-managers-decision-cover-end-date.njk', {
      amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED,
      isEditable: true,
      user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    });
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should render template with data and `false` isEditable', async () => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED });
      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED.amendmentId,
          facilityId: '12345',
        },
        session: {
          user: {
            ...MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
            teams: [{ id: TEAM_IDS.UNDERWRITER_MANAGERS }],
          },
        },
      };

      await amendmentUnderwritersDecision.getAmendmentAddUnderwriterManagersDecisionCoverEndDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-add-managers-decision-cover-end-date.njk', {
        amendment: MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED,
        isEditable: false,
        user: req.session.user,
      });
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: {} });
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      };

      await amendmentUnderwritersDecision.getAmendmentAddUnderwriterManagersDecisionCoverEndDate(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when amendment does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      };

      await amendmentUnderwritersDecision.getAmendmentAddUnderwriterManagersDecisionCoverEndDate(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
