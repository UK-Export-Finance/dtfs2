import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import mapAssignToSelectOptions from '../../../helpers/map-assign-to-select-options';
import amendmentLeadUnderwriterController from '.';
import { userIsInTeam } from '../../../helpers/user';
import { sortArrayOfObjectsAlphabetically } from '../../../helpers/array';
import CONSTANTS from '../../../constants';

import MOCKS from '../../../test-mocks/amendment-test-mocks';

describe('GET getAmendmentLeadUnderwriter()', () => {
  const isEditable = userIsInTeam(MOCKS.MOCK_USER_UNDERWRITER_MANAGER, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

  const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));

  beforeEach(() => {
    api.getUser = apiGetUserSpy;
  });

  it('should return an object with the correct parameters when no lead underwriter set', async () => {
    const result = await amendmentLeadUnderwriterController.getAmendmentLeadUnderwriter(
      MOCKS.MOCK_AMENDMENT,
      MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    );

    expect(result).toEqual({
      isEditable,
      currentLeadUnderWriter: undefined,
    });
  });

  it('should not call getUser API to get current lead underwriter user data', async () => {
    await amendmentLeadUnderwriterController.getAmendmentLeadUnderwriter(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);

    expect(apiGetUserSpy).not.toHaveBeenCalled();
  });

  it('should return an object with the lead underwriter when lead underwriter set', async () => {
    const result = await amendmentLeadUnderwriterController.getAmendmentLeadUnderwriter(
      MOCKS.MOCK_AMENDMENT_LEAD_UNDERWRITER,
      MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    );

    expect(result).toEqual({
      isEditable,
      leadUnderwriter: {
        _id: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        teams: expect.any(Array),
        username: expect.any(String),
      },
    });
  });
});

describe('GET getAssignAmendmentLeadUnderwriter()', () => {
  const req = {
    params: {
      _id: MOCKS.MOCK_DEAL._id,
      amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
      facilityId: '12345',
    },
    session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
  };

  const getTeamMembersSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_TEAM_UNDERWRITER_MANAGERS));

  const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));

  const res = mockRes();
  describe('when deal and amendments exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT, status: 200 });
      api.getTeamMembers = getTeamMembersSpy;
      api.getUser = apiGetUserSpy;
    });

    it('should render template with data for no lead underwriter assigned', async () => {
      await amendmentLeadUnderwriterController.getAssignAmendmentLeadUnderwriter(req, res);

      // NOTE: api.getTeamMembers stub only returns one team.
      const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(MOCKS.MOCK_TEAM_UNDERWRITER_MANAGERS, 'firstName');

      const expectedAssignToSelectOptions = mapAssignToSelectOptions(
        '',
        MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
        alphabeticalTeamMembers,
      );

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-assign-lead-underwriter.njk', {
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        assignToSelectOptions: expectedAssignToSelectOptions,
        amendment: MOCKS.MOCK_AMENDMENT,
        isEditable: true,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
      });
    });

    it('should render template with data for lead underwriter assigned', async () => {
      MOCKS.MOCK_AMENDMENT.leadUnderwriterId = '12345678';
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT, status: 200 });

      await amendmentLeadUnderwriterController.getAssignAmendmentLeadUnderwriter(req, res);

      // NOTE: api.getTeamMembers stub only returns one team.
      const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(MOCKS.MOCK_TEAM_UNDERWRITER_MANAGERS, 'firstName');

      const expectedAssignToSelectOptions = mapAssignToSelectOptions(
        MOCKS.MOCK_AMENDMENT.leadUnderwriterId,
        MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
        alphabeticalTeamMembers,
      );

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-assign-lead-underwriter.njk', {
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        assignToSelectOptions: expectedAssignToSelectOptions,
        amendment: MOCKS.MOCK_AMENDMENT,
        isEditable: true,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
      });
    });
  });

  describe('when deal or amendments don\'t exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(null);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT, status: 200 });
      api.getUser = apiGetUserSpy;
    });

    it('should redirect to not found if no deal found', async () => {
      const reqNoDeal = {
        params: {
          _id: '1',
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          facilityId: '12345',
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      };
      await amendmentLeadUnderwriterController.getAssignAmendmentLeadUnderwriter(reqNoDeal, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({});
      api.getUser = apiGetUserSpy;
    });

    it('should redirect to not found if no amendment found', async () => {
      const reqNoAmendment = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          facilityId: '12345',
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      };
      await amendmentLeadUnderwriterController.getAssignAmendmentLeadUnderwriter(reqNoAmendment, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('postAssignAmendmentLeadUnderwriter()', () => {
  const res = mockRes();

  const apiUpdateSpy = jest.fn(() => Promise.resolve({
    test: true,
  }));

  const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));

  beforeEach(() => {
    api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
    api.updateAmendment = apiUpdateSpy;
    api.getUser = apiGetUserSpy;
    api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT, status: 200 });
  });

  it('should call api.updateAmendment and redirect to /lead-underwriter with correct params if lead underwriter set', async () => {
    const req = {
      params: {
        _id: MOCKS.MOCK_DEAL._id,
        amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
        facilityId: '9999',
      },
      session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      body: {
        assignedTo: '12345678',
      },
    };

    await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

    const expectedUpdateObj = {
      leadUnderwriterId: MOCKS.MOCK_USER_UNDERWRITER_MANAGER._id,
    };

    expect(apiUpdateSpy).toHaveBeenCalledWith(
      req.params.facilityId,
      req.params.amendmentId,
      expectedUpdateObj,
    );

    expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/underwriting`);
  });

  it('should call api.updateAmendment and redirect to /lead-underwriter with correct params if unassigned', async () => {
    const req = {
      params: {
        _id: MOCKS.MOCK_DEAL._id,
        // amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
        // facilityId: '9999',
      },
      session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      body: {
        assignedTo: 'Unassigned',
      },
    };

    await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

    const expectedUpdateObj = {
      leadUnderwriterId: 'Unassigned',
    };

    expect(apiUpdateSpy).toHaveBeenCalledWith(
      req.params.facilityId,
      req.params.amendmentId,
      expectedUpdateObj,
    );

    expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/underwriting`);
  });

  describe('when amendment does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
      api.getAmendmentById = () => Promise.resolve({ data: {} });
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
          facilityId: '9999',
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
        body: {
          assignedTo: 'Unassigned',
        },
      };

      await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
