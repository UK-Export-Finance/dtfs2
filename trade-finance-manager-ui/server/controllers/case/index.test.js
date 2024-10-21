import { AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled } from '@ukef/dtfs2-common';
import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';
import { getTask, canDealBeCancelled } from '../helpers';
import mapAssignToSelectOptions from '../../helpers/map-assign-to-select-options';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  isDealCancellationEnabled: jest.fn().mockReturnValue(false),
}));

const res = mockRes();

const token = 'test-token';

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
  userToken: token,
};

describe('controllers - case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
  });

  describe('GET case deal', () => {
    describe('when deal exists', () => {
      let req;

      const mockDeal = {
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
        },
        tfm: {
          parties: [],
          tasks: [],
        },
        mock: true,
      };

      const mockAmendments = [
        {
          ukefFacilityId: '1234',
          facilityId: '12345',
          submittedByPim: false,
          status: AMENDMENT_STATUS.IN_PROGRESS,
        },
      ];

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () =>
          Promise.resolve({
            status: 200,
            data: mockAmendments,
          });
        api.getDealCancellation = jest.fn(() => ({}));

        req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };
      });

      it('should render deal template with data', async () => {
        await caseController.getCaseDeal(req, res);

        expect(res.render).toHaveBeenCalledWith('case/deal/deal.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'deal',
          dealId: req.params._id,
          user: session.user,
          hasDraftCancellation: false,
          showDealCancelButton: false,
          hasAmendmentInProgress: true,
          amendments: mockAmendments,
          amendmentsInProgress: mockAmendments,
        });
      });

      it('should check whether deal cancellation is enabled', async () => {
        await caseController.getCaseDeal(req, res);

        expect(canDealBeCancelled).toHaveBeenCalledTimes(1);
      });

      describe('when deal cancellation is enabled', () => {
        it('should render the template with showDealCancelButton=true', async () => {
          jest.mocked(canDealBeCancelled).mockReturnValueOnce(true);

          await caseController.getCaseDeal(req, res);

          expect(res.render).toHaveBeenCalledWith(
            'case/deal/deal.njk',
            expect.objectContaining({
              showDealCancelButton: true,
            }),
          );
        });

        it('should render the template with hasDraftCancellation=true when the cancellation object is not empty', async () => {
          jest.mocked(canDealBeCancelled).mockReturnValueOnce(true);
          jest.mocked(api.getDealCancellation).mockReturnValueOnce({ reason: 'a reason' });

          await caseController.getCaseDeal(req, res);

          expect(res.render).toHaveBeenCalledWith(
            'case/deal/deal.njk',
            expect.objectContaining({
              hasDraftCancellation: true,
            }),
          );
        });

        it('should render the template with hasDraftCancellation=false when the cancellation object is empty', async () => {
          jest.mocked(canDealBeCancelled).mockReturnValueOnce(true);
          jest.mocked(api.getDealCancellation).mockReturnValueOnce({});

          await caseController.getCaseDeal(req, res);

          expect(res.render).toHaveBeenCalledWith(
            'case/deal/deal.njk',
            expect.objectContaining({
              hasDraftCancellation: false,
            }),
          );
        });
      });

      describe('when deal cancellation is disabled', () => {
        it('should render the template with showDealCancelButton=false', async () => {
          jest.mocked(canDealBeCancelled).mockReturnValueOnce(false);

          await caseController.getCaseDeal(req, res);

          expect(res.render).toHaveBeenCalledWith(
            'case/deal/deal.njk',
            expect.objectContaining({
              showDealCancelButton: false,
            }),
          );
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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
          filterType: 'all',
          userId: req.session.user._id,
        };

        expect(apiGetDealSpy).toHaveBeenCalledWith(mockDeal._id, token, expectedTaskFiltersObj);

        expect(res.render).toHaveBeenCalledWith('case/tasks/tasks.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          tasks: mockDeal.tfm.tasks,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          selectedTaskFilter: 'all',
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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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

        expect(apiGetDealSpy).toHaveBeenCalledWith(mockDeal._id, token, expectedTaskFiltersObj);

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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
        }),
      );

      const groupId = '1';
      const taskId = '456';

      const mockDeal = {
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
            groupId,
            taskId,
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
          status: req.body.status,
          assignedTo: {
            userId: req.body.assignedTo,
          },
          updatedBy: req.session.user._id,
          urlOrigin: req.headers.origin,
        };

        expect(apiUpdateSpy).toHaveBeenCalledWith(mockDeal._id, groupId, taskId, expectedUpdateObj, token);

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
        _id: '61f6ac5b02fade01b1e8efef',
        facilitySnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
          isGef: false,
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
        status: AMENDMENT_STATUS.IN_PROGRESS,
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

      describe('showFacilityEndDate', () => {
        describe.each([
          {
            facilityFeatureFlagValue: true,
            isGefValue: true,
            expectedValue: true,
          },
          {
            facilityFeatureFlagValue: true,
            isGefValue: false,
            expectedValue: false,
          },
          {
            facilityFeatureFlagValue: false,
            isGefValue: true,
            expectedValue: false,
          },
          {
            facilityFeatureFlagValue: false,
            isGefValue: false,
            expectedValue: false,
          },
        ])('when the facility end date feature flag is $facilityFeatureFlagValue', ({ facilityFeatureFlagValue, isGefValue, expectedValue }) => {
          beforeEach(() => {
            jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(facilityFeatureFlagValue);
          });

          describe(`when the facility is ${isGefValue}`, () => {
            beforeEach(() => {
              api.getFacility = () => Promise.resolve({ ...mockFacility, facilitySnapshot: { ...mockFacility.facilitySnapshot, isGef: isGefValue } });
            });

            it(`should render with the showFacilityEndDate parameter as ${expectedValue}`, async () => {
              const req = {
                params: {
                  facilityId: mockFacility._id,
                },
                session,
              };

              await caseController.getCaseFacility(req, res);

              expect(res.render).toHaveBeenCalledWith(
                'case/facility/facility.njk',
                expect.objectContaining({
                  showFacilityEndDate: expectedValue,
                }),
              );
            });
          });
        });
      });

      it('should render facility template with data', async () => {
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
          showFacilityEndDate: false,
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
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
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
});
