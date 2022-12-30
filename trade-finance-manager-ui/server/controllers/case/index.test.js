/* eslint-disable no-underscore-dangle */
import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';
import { getTask } from '../helpers';
import mapAssignToSelectOptions from '../../helpers/map-assign-to-select-options';
import CONSTANTS from '../../constants';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
};

describe('controllers - case', () => {
  describe('GET case deal', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          parties: [],
          tasks: [],
        },
        mock: true,
      };

      const mockAmendments = [{
        ukefFacilityId: '1234',
        facilityId: '12345',
        submittedByPim: false,
        status: CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS,
      }];

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () =>
          Promise.resolve({
            status: 200,
            data: mockAmendments,
          });
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getCaseDeal(req, res);

        expect(res.render).toHaveBeenCalledWith('case/deal/deal.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'deal',
          dealId: req.params._id,
          user: session.user,
          hasAmendmentInProgress: true,
          amendments: mockAmendments,
          amendmentsInProgress: mockAmendments,
        });
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

        await caseController.getCaseDeal(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET case tasks', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          parties: [],
          tasks: [],
        },
        mock: true,
      };

      const apiGetDealSpy = jest.fn(() => Promise.resolve(mockDeal));

      beforeEach(() => {
        api.getDeal = apiGetDealSpy;
        api.getAmendmentsByDealId = () =>
          Promise.resolve({
            status: 200,
            data: [],
          });
      });

      it('should render tasks template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getCaseTasks(req, res);

        const expectedTaskFiltersObj = {
          filterType: 'user',
          userId: req.session.user._id,
        };

        expect(apiGetDealSpy).toHaveBeenCalledWith(mockDeal._id, expectedTaskFiltersObj);

        expect(res.render).toHaveBeenCalledWith('case/tasks/tasks.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          tasks: mockDeal.tfm.tasks,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          selectedTaskFilter: 'user',
          amendments: [],
          hasAmendmentInProgress: false,
          amendmentsInProgress: [],
        });
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

        await caseController.getCaseTasks(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST case tasks', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          parties: [],
          tasks: [],
        },
        mock: true,
      };

      const apiGetDealSpy = jest.fn(() => Promise.resolve(mockDeal));

      beforeEach(() => {
        api.getDeal = apiGetDealSpy;
        api.getAmendmentsByDealId = () =>
          Promise.resolve({
            status: 200,
            data: [],
          });
      });

      it('should render tasks template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            filterType: 'team',
          },
        };

        await caseController.filterCaseTasks(req, res);

        const expectedTaskFiltersObj = {
          filterType: req.body.filterType,
          teamId: req.session.user.teams[0],
          userId: req.session.user._id,
        };

        expect(apiGetDealSpy).toHaveBeenCalledWith(mockDeal._id, expectedTaskFiltersObj);

        expect(res.render).toHaveBeenCalledWith('case/tasks/tasks.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          tasks: mockDeal.tfm.tasks,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          selectedTaskFilter: req.body.filterType,
          amendments: [],
          hasAmendmentInProgress: false,
          amendmentsInProgress: [],
        });
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
          body: {
            filterType: 'team',
          },
        };

        await caseController.filterCaseTasks(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET case task', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          parties: [],
          tasks: [
            {
              groupTitle: 'Testing',
              id: 1,
              groupTasks: [
                {
                  id: '123',
                  groupId: 1,
                  assignedTo: {
                    userId: session.user._id,
                  },
                  team: {
                    id: 'TEAM_1',
                  },
                },
                {
                  id: '456',
                  groupId: 1,
                  canEdit: true,
                  assignedTo: {
                    userId: session.user._id,
                  },
                  team: {
                    id: 'TEAM_1',
                  },
                },
              ],
            },
          ],
        },
        mock: true,
      };

      const mockTeamMembers = [
        {
          _id: '1',
          firstName: 'a',
          lastName: 'b',
          teams: ['TEAM_1'],
        },
        {
          _id: '2',
          firstName: 'a',
          lastName: 'b',
          teams: ['TEAM_1'],
        },
        {
          _id: session.user._id,
          firstName: 'a',
          lastName: 'b',
          teams: ['TEAM_1'],
        },
      ];

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getTeamMembers = () => Promise.resolve(mockTeamMembers);
      });

      it('should render tasks template with data and task from deal', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
            groupId: '1',
            taskId: '456',
          },
          session,
        };

        const expectedTask = getTask(Number(req.params.groupId), req.params.taskId, mockDeal.tfm.tasks);

        await caseController.getCaseTask(req, res);

        expect(res.render).toHaveBeenCalledWith('case/tasks/task.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          task: expectedTask,
          assignToSelectOptions: mapAssignToSelectOptions(expectedTask.assignedTo.userId, session.user, mockTeamMembers),
        });
      });
    });

    describe('when another task is in progress and params.taskId does not match in progress id', () => {
      const mockDealWithInProgressTask = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          tasks: [
            {
              groupTitle: 'Testing',
              id: 1,
              groupTasks: [
                {
                  id: '123',
                  groupId: 1,
                  assignedTo: {
                    userId: session.user._id,
                  },
                  team: {
                    id: 'TEAM_1',
                  },
                },
                {
                  id: '456',
                  groupId: 1,
                  assignedTo: {
                    userId: session.user._id,
                  },
                  team: {
                    id: 'TEAM_1',
                  },
                  status: 'In progress',
                },
              ],
            },
          ],
        },
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDealWithInProgressTask);
      });

      it('should redirect to tasks route', async () => {
        const req = {
          params: {
            _id: mockDealWithInProgressTask._id,
            groupId: '1',
            taskId: '123',
          },
          session,
        };

        await caseController.getCaseTask(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDealWithInProgressTask._id}/tasks`);
      });
    });

    describe('when task does not exist', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          tasks: [
            {
              groupTitle: 'Testing',
              id: 1,
              groupTasks: [],
            },
          ],
        },
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
            taskId: '12345678',
          },
          session,
        };

        await caseController.getCaseTask(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });

    describe('when task cannot be edited', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          tasks: [
            {
              groupTitle: 'Testing',
              id: 1,
              groupTasks: [{ id: '123', groupId: 1, canEdit: false }],
            },
          ],
        },
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to /tasks route', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
            groupId: '1',
            taskId: '123',
          },
          session,
        };

        await caseController.getCaseTask(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/tasks`);
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

        await caseController.getCaseTask(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST case task', () => {
    describe('when deal exists', () => {
      const apiUpdateSpy = jest.fn(() =>
        Promise.resolve({
          test: true,
        }));

      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        tfm: {
          parties: [],
          tasks: [{ id: '123' }, { id: '456' }],
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.updateTask = apiUpdateSpy;
      });

      it('should call API and redirect to /tasks', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
            groupId: '1',
            taskId: '456',
          },
          session,
          body: {
            assignedTo: session.user._id,
            status: 'In progress',
          },
          headers: {
            origin: 'http://test.com',
          },
        };

        await caseController.putCaseTask(req, res);

        const expectedUpdateObj = {
          id: req.params.taskId,
          groupId: Number(req.params.groupId),
          status: req.body.status,
          assignedTo: {
            userId: req.body.assignedTo,
          },
          updatedBy: req.session.user._id,
          urlOrigin: req.headers.origin,
        };

        expect(apiUpdateSpy).toHaveBeenCalledWith(mockDeal._id, expectedUpdateObj);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/tasks`);
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
            groupId: '1',
            taskId: '456',
          },
          session,
          headers: {
            origin: 'http://test.com',
          },
        };

        await caseController.putCaseTask(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET case facility', () => {
    describe('when facility exists', () => {
      const mockFacility = {
        _id: '61f6ac5b02ffda01b1e8efef',
        facilitySnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
          dealId: '12345678',
          mock: true,
          value: 'GBP 1,000,000.00',
          dates: {
            coverEndDate: '2030-08-12T00:00:00.000+00:00',
          },
        },
        tfm: {
          ukefExposure: { exposure: 'GBP 57.21', timestamp: '1614954617041' },
          facilityValueInGBP: 238.39322963227846,
        },
      };

      const mockAmendment = {
        amendmentId: '6284bde5241c63001e40702d',
        facilityId: '625e99cb88eeeb001e33bf4b',
        dealId: '625e99cb88eeeb001e33bf47',
        createdAt: 1652866533,
        updatedAt: 1652876975,
        status: CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS,
        version: 1,
        createdBy: {},
        requestDate: 1652876967,
        changeCoverEndDate: true,
        changeFacilityValue: true,
        requireUkefApproval: false,
        coverEndDate: 1660307372,
        submittedByPim: true,
        effectiveDate: 1655027294,
        submissionDate: 1652867309,
        value: 112,
      };

      const mockDeal = {
        _id: '12345678',
        dealSnapshot: {
          _id: '12345678',
          mock: true,
        },
        tfm: {},
      };

      beforeEach(() => {
        api.getFacility = () => Promise.resolve(mockFacility);
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentInProgress = () => Promise.resolve({ status: 200, data: { amendmentId: '626bae8c43c01e02076352e1', version: 1 } });
        api.getAmendmentsByFacilityId = () => Promise.resolve({ status: 200, data: [mockAmendment] });
        api.getAmendmentsByDealId = () => Promise.resolve({ status: 200, data: [mockAmendment] });
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            facilityId: mockFacility._id,
          },
          session,
        };

        await caseController.getCaseFacility(req, res);
        expect(res.render).toHaveBeenCalledWith('case/facility/facility.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          facility: mockFacility.facilitySnapshot,
          facilityTfm: mockFacility.tfm,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'facility',
          facilityId: req.params.facilityId,
          user: session.user,
          showAmendmentButton: false,
          showContinueAmendmentButton: false,
          amendmentId: '626bae8c43c01e02076352e1',
          amendmentVersion: 1,
          hasAmendmentInProgress: true,
          hasAmendmentInProgressButton: false,
          allAmendments: expect.any(Array),
          amendmentsInProgress: expect.any(Array),
          amendments: expect.any(Array),
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getFacility = () => Promise.resolve();
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
        };

        await caseController.getCaseFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET case documents', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02ffda01b1e8efef',
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render documents template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getCaseDocuments(req, res);
        expect(res.render).toHaveBeenCalledWith('case/documents/documents.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          eStoreUrl: process.env.ESTORE_URL,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'documents',
          dealId: req.params._id,
          user: session.user,
          amendmentsInProgress: [],
          hasAmendmentInProgress: false,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
        };

        await caseController.getCaseDocuments(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST facility edit', () => {
    describe('when deal exists and no validation errors, it should redirect to parties page', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: ['123', '234'],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('when deal exists and no validation errors with bondBeneficiaryPartyUrn, it should redirect to parties page', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page if both URNs are correct', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondBeneficiaryPartyUrn: ['123', '234'],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('should return validation errors for both urns if both are incorrectly entered for bond beneficiary', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-beneficiary-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondBeneficiaryPartyUrn: ['!11', ' '],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-1',
              text: 'Enter a minimum of 3 numbers',
            },
            {
              href: '#partyUrn-2',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-1': {
              text: 'Enter a minimum of 3 numbers',
            },
            'partyUrn-2': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);
        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-beneficiary-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondBeneficiaryPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should return validation errors for both urns if both are incorrectly entered for bond issuer', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-issuer-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: ['!11', ' '],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-1',
              text: 'Enter a minimum of 3 numbers',
            },
            {
              href: '#partyUrn-2',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-1': {
              text: 'Enter a minimum of 3 numbers',
            },
            'partyUrn-2': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);

        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-issuer-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondIssuerPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should return validation errors for first urn if incorrectly entered for bond beneficiary', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-beneficiary-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondBeneficiaryPartyUrn: ['11', '1234'],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-1',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-1': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);

        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-beneficiary-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondBeneficiaryPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should return validation errors for first urn is incorrectly entered for bond issuer', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-issuer-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: [' ', '1234'],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-1',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-1': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);

        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-issuer-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondIssuerPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should return validation errors for second urn if second bond is incorrectly entered for bond beneficiary', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-beneficiary-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondBeneficiaryPartyUrn: ['123', '123@'],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-2',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-2': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);
        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-beneficiary-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondBeneficiaryPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should return validation errors for second urn is incorrectly entered for bond issuer', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-issuer-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: ['1233', 'NA'],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-2',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-2': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);

        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-issuer-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondIssuerPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should redirect to parties page if both URNS are left blank for bond beneficiary', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondBeneficiaryPartyUrn: ['', ''],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('should redirect to parties page if both URNS are left blank for bond issuer', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: ['', ''],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('should return validation errors for first urn is incorrectly entered for bond beneficiary and only one URN and bond', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-beneficiary-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1],
            bondBeneficiaryPartyUrn: ['NA'],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-1',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-1': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);

        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-beneficiary-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondBeneficiaryPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should return validation errors for first urn is incorrectly entered for bond issuer and only one URN and bond', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to bonds-issuer-edit page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1],
            bondIssuerPartyUrn: ['NA'],
          },
          session,
        };

        const errors = {
          errorSummary: [
            {
              href: '#partyUrn-1',
              text: 'Enter a minimum of 3 numbers',
            },
          ],
          fieldErrors: {
            'partyUrn-1': {
              text: 'Enter a minimum of 3 numbers',
            },
          },
        };

        await caseController.postTfmFacility(req, res);

        expect(res.render).toHaveBeenCalledWith(
          'case/parties/edit/bonds-issuer-edit.njk',
          {
            userCanEdit: false,
            renderEditLink: false,
            renderEditForm: true,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
            urn: req.body.bondIssuerPartyUrn,
            errors,
          },
        );
      });
    });

    describe('should redirect to parties page if only one URN and left blank for bond beneficiary', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1],
            bondBeneficiaryPartyUrn: [''],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('should redirect to parties page if only one URN and left blank for bond issuer', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1],
            bondIssuerPartyUrn: [''],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('should redirect to parties page if only one URN and entered correctly for bond beneficiary', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1],
            bondBeneficiaryPartyUrn: ['12121'],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
      });
    });

    describe('should redirect to parties page if only one URN and entered correctly for bond issuer', () => {
      const mockDeal = {
        _id: '61f6ac5b02ffda01b1e8efef',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should redirect to parties page', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1],
            bondIssuerPartyUrn: ['45454'],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/parties`);
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
          body: {},
          session,
        };

        await caseController.postTfmFacility(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
