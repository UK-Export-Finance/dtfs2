import {
  TFM_AMENDMENT_STATUS,
  DEAL_SUBMISSION_TYPE,
  DEAL_TYPE,
  TFM_DEAL_CANCELLATION_STATUS,
  MONGO_DB_COLLECTIONS,
  PORTAL_AMENDMENT_STATUS,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
} from '@ukef/dtfs2-common';
import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';
import { getTask } from '../helpers';
import mapAssignToSelectOptions from '../../helpers/map-assign-to-select-options';
import { isDealCancellationEnabled, isDealCancellationEnabledForUser } from '../helpers/deal-cancellation-enabled.helper';

const mockGetDealSuccessBannerMessage = jest.fn();

jest.mock('../helpers/get-success-banner-message.helper', () => ({
  getDealSuccessBannerMessage: (params) => mockGetDealSuccessBannerMessage(params),
}));

jest.mock('../helpers/deal-cancellation-enabled.helper', () => ({
  ...jest.requireActual('../helpers/deal-cancellation-enabled.helper'),
  isDealCancellationEnabledForUser: jest.fn().mockReturnValue(false),
  isDealCancellationEnabled: jest.fn().mockReturnValue(false),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

const { DRAFT, COMPLETED } = TFM_DEAL_CANCELLATION_STATUS;

const mockSuccessBannerMessage = 'mock success message';
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

const mockAmendment = {
  amendmentId: '6284bde5241c63001e40702d',
  facilityId: '625e99cb88eeeb001e33bf4b',
  dealId: '625e99cb88eeeb001e33bf47',
  createdAt: 1652866533,
  updatedAt: 1652876975,
  status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
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

describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled', () => {
  beforeEach(() => {
    jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
  });

  describe('controllers - case', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      jest.spyOn(console, 'error');
    });

    describe('GET case deal', () => {
      describe('when deal exists', () => {
        let req;

        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            details: { ukefDealId: 'ukefDealId' },
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
            dealType: DEAL_TYPE.GEF,
            ukefDealId: 'ukefDealId',
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
            submittedByPim: true,
            status: TFM_AMENDMENT_STATUS.IN_PROGRESS,
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

          mockGetDealSuccessBannerMessage.mockResolvedValue(mockSuccessBannerMessage);

          req = {
            params: {
              _id: mockDeal._id,
            },
            session,
            flash: jest.fn().mockReturnValue([]),
          };
        });

        it('should render deal template with data', async () => {
          await caseController.getCaseDeal(req, res);

          expect(res.render).toHaveBeenCalledWith('case/deal/deal.njk', {
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: MONGO_DB_COLLECTIONS.DEALS,
            dealId: req.params._id,
            user: session.user,
            hasDraftCancellation: false,
            showDealCancelButton: false,
            hasAmendmentInProgressSubmittedFromPim: true,
            amendments: mockAmendments,
            amendmentsInProgressSubmittedFromPim: mockAmendments,
            successMessage: mockSuccessBannerMessage,
            inProgressPortalAmendments: [],
            hasInProgressPortalAmendments: false,
            hasFutureEffectiveDatePortalAmendments: false,
            formattedFutureEffectiveDatePortalAmendments: [],
          });
        });

        it('should check whether deal cancellation is enabled', async () => {
          await caseController.getCaseDeal(req, res);

          expect(isDealCancellationEnabledForUser).toHaveBeenCalledWith(DEAL_SUBMISSION_TYPE.AIN, session.user);
        });

        describe('when deal cancellation is enabled', () => {
          beforeEach(() => {
            jest.mocked(isDealCancellationEnabledForUser).mockReturnValue(true);
            jest.mocked(isDealCancellationEnabled).mockReturnValue(true);
          });

          describe('when the deal can still be cancelled', () => {
            it('should render the template with showDealCancelButton=true', async () => {
              jest.mocked(api.getDealCancellation).mockReturnValueOnce({ status: DRAFT });

              await caseController.getCaseDeal(req, res);

              expect(res.render).toHaveBeenCalledWith(
                'case/deal/deal.njk',
                expect.objectContaining({
                  showDealCancelButton: true,
                }),
              );
            });
          });

          describe('when the deal is already cancelled', () => {
            it('should render the template with showDealCancelButton=false', async () => {
              jest.mocked(api.getDealCancellation).mockReturnValueOnce({ status: COMPLETED });

              await caseController.getCaseDeal(req, res);

              expect(res.render).toHaveBeenCalledWith(
                'case/deal/deal.njk',
                expect.objectContaining({
                  showDealCancelButton: false,
                }),
              );
            });
          });

          describe('when the deal cancellation is in draft', () => {
            it('should render the template with hasDraftCancellation=true', async () => {
              jest.mocked(api.getDealCancellation).mockReturnValueOnce({ status: DRAFT });

              await caseController.getCaseDeal(req, res);

              expect(res.render).toHaveBeenCalledWith(
                'case/deal/deal.njk',
                expect.objectContaining({
                  hasDraftCancellation: true,
                }),
              );
            });
          });

          describe('when the deal cancellation is not yet started', () => {
            it('should render the template with hasDraftCancellation=false', async () => {
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
        });

        describe('when deal cancellation is disabled', () => {
          it('should render the template with showDealCancelButton=false', async () => {
            jest.mocked(isDealCancellationEnabledForUser).mockReturnValue(false);
            jest.mocked(isDealCancellationEnabled).mockReturnValue(false);

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

      describe('when an error is thrown', () => {
        beforeEach(() => {
          api.getDeal = () => Promise.reject(new Error('An exception has occurred'));
        });

        it('should render problem with service page with console error', async () => {
          const req = {
            params: {
              _id: '1',
            },
            session,
          };

          await caseController.getCaseDeal(req, res);

          expect(console.error).toHaveBeenCalledWith('Unable to render deal %o', new Error('An exception has occurred'));
          expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
        });
      });
    });

    describe('GET case tasks', () => {
      describe('when deal exists', () => {
        const mockDeal = {
          _id: '61f6ac5b02fade01b1e8efef',
          dealSnapshot: {
            _id: '61f6ac5b02fade01b1e8efef',
            dealType: DEAL_TYPE.GEF,
            ukefDealId: 'ukefDealId',
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

          mockGetDealSuccessBannerMessage.mockResolvedValue(mockSuccessBannerMessage);
        });

        it('should render tasks template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            session,
            flash: jest.fn(() => []),
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
            successMessage: mockSuccessBannerMessage,
            dealId: req.params._id,
            user: session.user,
            selectedTaskFilter: 'all',
            amendments: [],
            hasAmendmentInProgressSubmittedFromPim: false,
            amendmentsInProgressSubmittedFromPim: [],
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
            hasAmendmentInProgressSubmittedFromPim: false,
            amendmentsInProgressSubmittedFromPim: [],
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
      const mockDeal = {
        _id: '12345678',
        dealSnapshot: {
          _id: '12345678',
          mock: true,
        },
        tfm: {},
      };

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
              isGefValue: true,
              expectedValue: true,
            },
            {
              isGefValue: false,
              expectedValue: false,
            },
          ])('when isGef is $isGefValue', ({ isGefValue, expectedValue }) => {
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

        it('should render facility template with data', async () => {
          api.getAmendmentsByDealId = () => Promise.resolve({ status: 200, data: [mockAmendment] });
          api.getAmendmentsByFacilityId = () => Promise.resolve({ status: 200, data: [mockAmendment] });

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
            activeSubNavigation: MONGO_DB_COLLECTIONS.FACILITIES,
            facilityId: req.params.facilityId,
            user: session.user,
            showAmendmentButton: false,
            showContinueAmendmentButton: false,
            amendmentId: '626bae8c43c01e02076352e1',
            amendmentVersion: 1,
            hasAmendmentInProgressSubmittedFromPim: true,
            hasAmendmentInProgressButton: false,
            allAmendments: expect.any(Array),
            amendmentsInProgressSubmittedFromPim: expect.any(Array),
            amendments: expect.any(Array),
            showFacilityEndDate: false,
            inProgressPortalAmendments: [],
            hasInProgressPortalAmendments: false,
            hasFutureEffectiveDatePortalAmendments: false,
            futureEffectiveDatePortalAmendment: undefined,
          });
        });

        it('should render facility template with data when portal amendments are present', async () => {
          const mockPortalAmendment = [
            {
              ukefFacilityId: '1234',
              facilityId: '12345',
              status: PORTAL_AMENDMENT_STATUS.DRAFT,
            },
          ];

          api.getAmendmentsByDealId = () => Promise.resolve({ status: 200, data: mockPortalAmendment });
          api.getAmendmentsByFacilityId = () => Promise.resolve({ status: 200, data: mockPortalAmendment });

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
            activeSubNavigation: MONGO_DB_COLLECTIONS.FACILITIES,
            facilityId: req.params.facilityId,
            user: session.user,
            showAmendmentButton: false,
            showContinueAmendmentButton: false,
            amendmentId: '626bae8c43c01e02076352e1',
            amendmentVersion: 1,
            hasAmendmentInProgressSubmittedFromPim: false,
            hasAmendmentInProgressButton: false,
            allAmendments: expect.any(Array),
            amendmentsInProgressSubmittedFromPim: [],
            amendments: expect.any(Array),
            showFacilityEndDate: false,
            inProgressPortalAmendments: expect.any(Array),
            hasInProgressPortalAmendments: true,
            hasFutureEffectiveDatePortalAmendments: false,
            futureEffectiveDatePortalAmendment: undefined,
          });
        });

        it('should render facility template with data when multiple portal amendments are present', async () => {
          const mockPortalAmendment = [
            {
              ukefFacilityId: '1234',
              facilityId: '12345',
              status: PORTAL_AMENDMENT_STATUS.DRAFT,
            },
            {
              ukefFacilityId: '1233',
              facilityId: '12346',
              status: PORTAL_AMENDMENT_STATUS.DRAFT,
            },
          ];

          api.getAmendmentsByDealId = () => Promise.resolve({ status: 200, data: mockPortalAmendment });
          api.getAmendmentsByFacilityId = () => Promise.resolve({ status: 200, data: mockPortalAmendment });

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
            activeSubNavigation: MONGO_DB_COLLECTIONS.FACILITIES,
            facilityId: req.params.facilityId,
            user: session.user,
            showAmendmentButton: false,
            showContinueAmendmentButton: false,
            amendmentId: '626bae8c43c01e02076352e1',
            amendmentVersion: 1,
            hasAmendmentInProgressSubmittedFromPim: false,
            hasAmendmentInProgressButton: false,
            allAmendments: expect.any(Array),
            amendmentsInProgressSubmittedFromPim: [],
            amendments: expect.any(Array),
            showFacilityEndDate: false,
            inProgressPortalAmendments: expect.any(Array),
            hasInProgressPortalAmendments: true,
            hasFutureEffectiveDatePortalAmendments: false,
            formattedFutureEffectiveDatePortalAmendments: undefined,
          });
        });
      });

      describe('when facility does not exist', () => {
        beforeEach(() => {
          api.getFacility = () => Promise.resolve({});
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentInProgress = () => Promise.resolve({ status: 200, data: { amendmentId: '626bae8c43c01e02076352e1', version: 1 } });
          api.getAmendmentsByFacilityId = () => Promise.resolve({ status: 200, data: [] });
          api.getAmendmentsByDealId = () => Promise.resolve({ status: 200, data: [] });
        });

        it('should render problem with service page upon an error', async () => {
          // Arrange
          const req = {
            params: {
              _id: '61f6ac5b02fade01b1e8efef',
            },
            session,
          };

          // Act
          await caseController.getCaseFacility(req, res);

          // Assert
          expect(console.error).toHaveBeenCalledWith('Error getting case facility %o', new Error("Cannot read properties of undefined (reading 'isGef')"));
          expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
        });
      });

      describe('when the deal either does not exists or is corrupted', () => {
        beforeEach(() => {
          api.getDeal = () => Promise.resolve();
        });

        it('should render problem with service page with a console error', async () => {
          const req = {
            params: {
              _id: '1',
            },
            session,
          };

          await caseController.getCaseFacility(req, res);

          expect(console.error).toHaveBeenCalledWith('An error occurred while rendering a TFM deal %s', req.params._id);
          expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
        });
      });

      describe('when the facilities does not exist', () => {
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
            dealType: DEAL_TYPE.GEF,
            ukefDealId: 'ukefDealId',
          },
          mock: true,
          tfm: {},
        };

        beforeEach(() => {
          api.getDeal = () => Promise.resolve(mockDeal);
          api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
          api.getDealCancellation = jest.fn(() => Promise.resolve({}));
          mockGetDealSuccessBannerMessage.mockResolvedValue(mockSuccessBannerMessage);
        });

        it('should render documents template with data', async () => {
          const req = {
            params: {
              _id: mockDeal._id,
            },
            session,
            flash: jest.fn(() => []),
          };

          await caseController.getCaseDocuments(req, res);
          expect(res.render).toHaveBeenCalledWith('case/documents/documents.njk', {
            deal: mockDeal.dealSnapshot,
            tfm: mockDeal.tfm,
            eStoreUrl: process.env.ESTORE_URL,
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'documents',
            successMessage: mockSuccessBannerMessage,
            dealId: req.params._id,
            user: session.user,
            amendmentsInProgressSubmittedFromPim: [],
            hasAmendmentInProgressSubmittedFromPim: false,
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

    describe('formatCompletedAmendmentDetails', () => {
      describe('when no amendments are passed in', () => {
        it('should return an empty array', () => {
          const result = caseController.formatCompletedAmendmentDetails([]);
          expect(result).toEqual([]);
        });
      });

      describe('when amendment only has a version', () => {
        it('should return the amendment version for the amendment name', () => {
          // Act
          const result = caseController.formatCompletedAmendmentDetails([mockAmendment]);

          // Assert
          expect(result[0].name).toEqual(`Amendment ${mockAmendment.version}`);
        });
      });

      describe('when amendment has a reference number', () => {
        it('should return the amendment version for the amendment name', () => {
          // Arrange
          const amendmentWithRef = { ...mockAmendment, referenceNumber: 'A123' };

          // Act
          const result = caseController.formatCompletedAmendmentDetails([amendmentWithRef]);

          // Assert
          expect(result[0].name).toEqual(`Amendment ${mockAmendment.version}`);
        });
      });
    });
  });
});

describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled', () => {
  beforeEach(() => {
    jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
  });

  describe('formatCompletedAmendmentDetails', () => {
    describe('when amendment only has a version', () => {
      it('should return the amendment version for the amendment name', () => {
        // Act
        const result = caseController.formatCompletedAmendmentDetails([mockAmendment]);

        // Assert
        expect(result[0].name).toEqual(`Amendment ${mockAmendment.version}`);
      });
    });

    describe('when amendment has a reference number', () => {
      it('should return the amendment reference number for the amendment name', () => {
        // Arrange
        const amendmentWithRef = { ...mockAmendment, referenceNumber: 'A123' };

        // Act
        const result = caseController.formatCompletedAmendmentDetails([amendmentWithRef]);

        // Assert
        expect(result[0].name).toEqual(`Amendment ${amendmentWithRef.referenceNumber}`);
      });
    });
  });
});
