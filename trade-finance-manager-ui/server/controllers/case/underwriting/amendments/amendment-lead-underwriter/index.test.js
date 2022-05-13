import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';
import mapAssignToSelectOptions from '../../../../../helpers/map-assign-to-select-options';
import amendmentLeadUnderwriterController from '.';
import { canUserEditLeadUnderwriter } from '../helpers';
import { sortArrayOfObjectsAlphabetically } from '../../../../../helpers/array';

import MOCKS from '../test-mocks/amendment-test-mocks';

describe('GET getAmendmentLeadUnderwriter()', () => {
  const userCanEdit = canUserEditLeadUnderwriter(MOCKS.session.user);

  const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));

  beforeEach(() => {
    api.getUser = apiGetUserSpy;
  });

  it('it should return an object with the correct parameters when no lead underwriter set', async () => {
    const result = await amendmentLeadUnderwriterController.getAmendmentLeadUnderwriter(
      MOCKS.MOCK_DEAL,
      MOCKS.MOCK_AMENDMENT,
      MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    );

    expect(result).toEqual({
      userCanEdit,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: MOCKS.MOCK_DEAL.dealSnapshot,
      tfm: MOCKS.MOCK_DEAL.tfm,
      dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
      user: MOCKS.session.user,
      amendment: MOCKS.MOCK_AMENDMENT,
      currentLeadUnderWriter: undefined,
    });
  });

  it('should not call getUser API to get current lead underwriter user data', async () => {
    await amendmentLeadUnderwriterController.getAmendmentLeadUnderwriter(MOCKS.MOCK_DEAL, MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);

    expect(apiGetUserSpy).not.toHaveBeenCalled();
  });

  it('it should return an object with the lead underwriter when lead underwriter set', async () => {
    const result = await amendmentLeadUnderwriterController.getAmendmentLeadUnderwriter(
      MOCKS.MOCK_DEAL,
      MOCKS.MOCK_AMENDMENT_LEAD_UNDERWRITER,
      MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    );

    expect(result).toEqual({
      userCanEdit,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: MOCKS.MOCK_DEAL.dealSnapshot,
      tfm: MOCKS.MOCK_DEAL.tfm,
      dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
      user: MOCKS.session.user,
      amendment: MOCKS.MOCK_AMENDMENT_LEAD_UNDERWRITER,
      currentLeadUnderWriter: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
    });
  });
});

describe('GET getAssignAmendmentLeadUnderwriter()', () => {
  const req = {
    params: {
      _id: MOCKS.MOCK_DEAL._id,
      amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
      facilityId: '12345',
    },
    session: MOCKS.session,
  };

  const getTeamMembersSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_TEAM_UNDERWRITER_MANAGERS));

  const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));

  const res = mockRes();
  describe('when deal and amendments exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
      api.getTeamMembers = getTeamMembersSpy;
      api.getUser = apiGetUserSpy;
    });

    it('should render template with data for no lead underwriter assigned', async () => {
      await amendmentLeadUnderwriterController.getAssignAmendmentLeadUnderwriter(req, res);

      // NOTE: api.getTeamMembers stub only returns one team.
      const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(MOCKS.MOCK_TEAM_UNDERWRITER_MANAGERS, 'firstName');

      const expectedAssignToSelectOptions = mapAssignToSelectOptions(
        '',
        MOCKS.session.user,
        alphabeticalTeamMembers,
      );

      expect(res.render).toHaveBeenCalledWith('case/underwriting/amendments/amendment-lead-underwriter/amendment-assign-lead-underwriter.njk', {
        activeSubNavigation: 'underwriting',
        deal: MOCKS.MOCK_DEAL.dealSnapshot,
        tfm: MOCKS.MOCK_DEAL.tfm,
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        user: MOCKS.session.user,
        assignToSelectOptions: expectedAssignToSelectOptions,
        amendment: MOCKS.MOCK_AMENDMENT.amendments,
      });
    });

    it('should render template with data for lead underwriter assigned', async () => {
      MOCKS.MOCK_AMENDMENT.amendments.leadUnderwriter = { userId: '12345678' };
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });

      await amendmentLeadUnderwriterController.getAssignAmendmentLeadUnderwriter(req, res);

      // NOTE: api.getTeamMembers stub only returns one team.
      const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(MOCKS.MOCK_TEAM_UNDERWRITER_MANAGERS, 'firstName');

      const expectedAssignToSelectOptions = mapAssignToSelectOptions(
        MOCKS.MOCK_AMENDMENT.amendments.leadUnderwriter.userId,
        MOCKS.session.user,
        alphabeticalTeamMembers,
      );

      expect(res.render).toHaveBeenCalledWith('case/underwriting/amendments/amendment-lead-underwriter/amendment-assign-lead-underwriter.njk', {
        activeSubNavigation: 'underwriting',
        deal: MOCKS.MOCK_DEAL.dealSnapshot,
        tfm: MOCKS.MOCK_DEAL.tfm,
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        user: MOCKS.session.user,
        assignToSelectOptions: expectedAssignToSelectOptions,
        amendment: MOCKS.MOCK_AMENDMENT.amendments,
      });
    });
  });

  describe('when deal or amendments don\'t exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(null);
      api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
      api.getUser = apiGetUserSpy;
    });

    it('should redirect to not found if no deal found', async () => {
      const reqNoDeal = {
        params: {
          _id: '1',
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '12345',
        },
        session: MOCKS.session,
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
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '12345',
        },
        session: MOCKS.session,
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
    api.getAmendmentById = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT.amendments });
  });

  it('it should call api.updateAmendment and redirect to /lead-underwriter with correct params if lead underwriter set', async () => {
    const req = {
      params: {
        _id: MOCKS.MOCK_DEAL._id,
        amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
        facilityId: '9999',
      },
      session: MOCKS.session,
      body: {
        assignedTo: '12345678',
      },
    };

    await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

    const expectedUpdateObj = {
      leadUnderwriter: {
        userId: MOCKS.MOCK_USER_UNDERWRITER_MANAGER._id,
        firstName: MOCKS.MOCK_USER_UNDERWRITER_MANAGER.firstName,
        lastName: MOCKS.MOCK_USER_UNDERWRITER_MANAGER.lastName,
        email: MOCKS.MOCK_USER_UNDERWRITER_MANAGER.email,
      },
    };

    expect(apiUpdateSpy).toHaveBeenCalledWith(
      req.params.facilityId,
      req.params.amendmentId,
      expectedUpdateObj,
    );

    expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/underwriting`);
  });

  it('it should call api.updateAmendment and redirect to /lead-underwriter with correct params if unassigned', async () => {
    const req = {
      params: {
        _id: MOCKS.MOCK_DEAL._id,
        amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
        facilityId: '9999',
      },
      session: MOCKS.session,
      body: {
        assignedTo: 'Unassigned',
      },
    };

    await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

    const expectedUpdateObj = {
      leadUnderwriter: {
        userId: 'Unassigned',
        firstName: '',
        lastName: '',
        email: '',
      },
    };

    expect(apiUpdateSpy).toHaveBeenCalledWith(
      req.params.facilityId,
      req.params.amendmentId,
      expectedUpdateObj,
    );

    expect(res.redirect).toHaveBeenCalledWith(`/case/${MOCKS.MOCK_DEAL._id}/underwriting`);
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '9999',
        },
        session: MOCKS.sessionUnderwriter,
        body: {
          assignedTo: 'Unassigned',
        },
      };

      await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

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
          _id: MOCKS.MOCK_DEAL._id,
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '9999',
        },
        session: MOCKS.session,
        body: {
          assignedTo: 'Unassigned',
        },
      };

      await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
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
          amendmentId: MOCKS.MOCK_AMENDMENT.amendments.amendmentId,
          facilityId: '9999',
        },
        session: MOCKS.session,
        body: {
          assignedTo: 'Unassigned',
        },
      };

      await amendmentLeadUnderwriterController.postAssignAmendmentLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
