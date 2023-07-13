/* eslint-disable no-underscore-dangle */
import api from '../../../../api';
import { mockRes } from '../../../../test-mocks';
import mapAssignToSelectOptions from '../../../../helpers/map-assign-to-select-options';
import underwriterLeadUnderwriterController from '.';
import { userIsInTeam } from '../../../../helpers/user';
import CONSTANTS from '../../../../constants';
import { sortArrayOfObjectsAlphabetically } from '../../../../helpers/array';

const res = mockRes();

const MOCK_USER_UNDERWRITER_MANAGER = {
  _id: '12345678',
  username: 'UNDERWRITER_MANAGER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITER_MANAGERS'],
};

const MOCK_USER_TEAM_USER = {
  _id: '100200301',
  username: 'UNDERWRITER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['TEAM1'],
};

const MOCK_TEAM_UNDERWRITER_MANAGERS = [MOCK_USER_UNDERWRITER_MANAGER];

const session = {
  user: MOCK_USER_UNDERWRITER_MANAGER,
};

const MOCK_DEAL = {
  _id: '61f6ac5b02ffda01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02ffda01b1e8efef',
    submissionType: 'Manual Inclusion Application',
  },
  tfm: {
    leadUnderwriter: '12345678910',
  },
};

const dealId = MOCK_DEAL._id;

describe('GET underwriting - lead underwriter', () => {
  const userCanEdit = userIsInTeam(session.user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

  describe('when deal exists', () => {
    const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCK_USER_UNDERWRITER_MANAGER));

    beforeEach(() => {
      api.getUser = apiGetUserSpy;
    });

    it('should return an object with the correct parameters', async () => {
      const result = await underwriterLeadUnderwriterController.getLeadUnderwriter(MOCK_DEAL, MOCK_USER_UNDERWRITER_MANAGER);

      expect(result).toEqual({
        userCanEdit,
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: MOCK_DEAL.dealSnapshot,
        tfm: MOCK_DEAL.tfm,
        dealId: MOCK_DEAL.dealSnapshot._id,
        user: session.user,
        currentLeadUnderWriter: MOCK_USER_UNDERWRITER_MANAGER,
      });
    });

    it('should call getUser API to get current lead underwriter user data', async () => {
      const mockToken = 'mockToken';

      await underwriterLeadUnderwriterController.getLeadUnderwriter(MOCK_DEAL, MOCK_USER_UNDERWRITER_MANAGER, mockToken);

      expect(apiGetUserSpy).toHaveBeenCalledWith(MOCK_DEAL.tfm.leadUnderwriter, mockToken);
    });
  });

  describe('when current lead underwriter is `Unassigned`', () => {
    const MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER = {
      dealSnapshot: MOCK_DEAL.dealSnapshot,
      tfm: {
        leadUnderwriter: 'Unassigned',
      },
    };

    const apiGetUserSpy = jest.fn(() => Promise.resolve({}));

    beforeEach(() => {
      api.getUser = apiGetUserSpy;
    });

    it('should NOT call getUser API and should return an object with undefined currentLeadUnderWriter', async () => {
      const result = await underwriterLeadUnderwriterController.getLeadUnderwriter(MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER, MOCK_USER_UNDERWRITER_MANAGER);

      expect(apiGetUserSpy).not.toHaveBeenCalled();

      expect(result).toEqual({
        userCanEdit,
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER.dealSnapshot,
        tfm: MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER.tfm,
        dealId: MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER.dealSnapshot._id,
        user: session.user,
        currentLeadUnderWriter: undefined,
      });
    });
  });
});

describe('GET underwriting - assign lead underwriter', () => {
  describe('when deal exists', () => {
    const req = {
      params: {
        _id: dealId,
      },
      session,
    };

    const getTeamMembersSpy = jest.fn(() => Promise.resolve(MOCK_TEAM_UNDERWRITER_MANAGERS));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCK_DEAL);
      api.getUser = () => Promise.resolve(MOCK_USER_UNDERWRITER_MANAGER);
      api.getTeamMembers = getTeamMembersSpy;
    });

    it('should call api.getTeamMembers twice with underwriter managers and underwriters', async () => {
      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);

      expect(getTeamMembersSpy).toBeCalledTimes(2);

      expect(getTeamMembersSpy.mock.calls).toEqual([[CONSTANTS.TEAMS.UNDERWRITER_MANAGERS], [CONSTANTS.TEAMS.UNDERWRITERS]]);
    });

    it('should render template with data', async () => {
      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);

      // NOTE: api.getTeamMembers stub only returns one team.
      const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(MOCK_TEAM_UNDERWRITER_MANAGERS, 'firstName');

      const expectedAssignToSelectOptions = mapAssignToSelectOptions(MOCK_DEAL.tfm.leadUnderwriter, session.user, alphabeticalTeamMembers);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/lead-underwriter/assign-lead-underwriter.njk', {
        activeSubNavigation: 'underwriting',
        deal: MOCK_DEAL.dealSnapshot,
        tfm: MOCK_DEAL.tfm,
        dealId: MOCK_DEAL.dealSnapshot._id,
        user: session.user,
        assignToSelectOptions: expectedAssignToSelectOptions,
      });
    });
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: {
          user: MOCK_USER_TEAM_USER,
        },
      };

      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - assign lead underwriter', () => {
  const apiUpdateSpy = jest.fn(() =>
    Promise.resolve({
      test: true,
    }));

  beforeEach(() => {
    api.getDeal = () => Promise.resolve(MOCK_DEAL);
    api.updateLeadUnderwriter = apiUpdateSpy;
  });

  it('should call api.updateLeadUnderwriter and redirect to /lead-underwriter', async () => {
    const req = {
      params: {
        _id: dealId,
      },
      session,
      body: {
        assignedTo: '123-test',
      },
    };

    await underwriterLeadUnderwriterController.postAssignLeadUnderwriter(req, res);

    const expectedUpdateObj = {
      userId: req.body.assignedTo,
    };

    expect(apiUpdateSpy).toHaveBeenCalledWith(MOCK_DEAL._id, expectedUpdateObj);
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: {
          user: MOCK_USER_TEAM_USER,
        },
      };

      await underwriterLeadUnderwriterController.postAssignLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await underwriterLeadUnderwriterController.postAssignLeadUnderwriter(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
