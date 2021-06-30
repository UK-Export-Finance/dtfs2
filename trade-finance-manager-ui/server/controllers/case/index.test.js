/* eslint-disable no-underscore-dangle */
import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';
import { getTask } from './helpers';
import mapAssignToSelectOptions from '../../helpers/map-assign-to-select-options';

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
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        tfm: {
          parties: [],
          tasks: [],
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
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
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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

        expect(apiGetDealSpy).toHaveBeenCalledWith(
          mockDeal._id,
          expectedTaskFiltersObj,
        );

        expect(res.render).toHaveBeenCalledWith('case/tasks/tasks.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          tasks: mockDeal.tfm.tasks,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          selectedTaskFilter: 'user',
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
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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

        expect(apiGetDealSpy).toHaveBeenCalledWith(
          mockDeal._id,
          expectedTaskFiltersObj,
        );

        expect(res.render).toHaveBeenCalledWith('case/tasks/tasks.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          tasks: mockDeal.tfm.tasks,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          selectedTaskFilter: req.body.filterType,
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
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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

        const expectedTask = getTask(
          Number(req.params.groupId),
          req.params.taskId,
          mockDeal.tfm.tasks,
        );

        await caseController.getCaseTask(req, res);

        expect(res.render).toHaveBeenCalledWith('case/tasks/task.njk', {
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'tasks',
          dealId: req.params._id,
          user: session.user,
          task: expectedTask,
          assignToSelectOptions: mapAssignToSelectOptions(
            expectedTask.assignedTo.userId,
            session.user,
            mockTeamMembers,
          ),
        });
      });
    });

    describe('when another task is in progress and params.taskId does not match in progress id', () => {
      const mockDealWithInProgressTask = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
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
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        tfm: {
          tasks: [
            {
              groupTitle: 'Testing',
              id: 1,
              groupTasks: [
                { id: '123', groupId: 1, canEdit: false },
              ],
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
      const apiUpdateSpy = jest.fn(() => Promise.resolve({
        test: true,
      }));

      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        tfm: {
          parties: [],
          tasks: [
            { id: '123' },
            { id: '456' },
          ],
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
          updatedBy: req.session.user._id, // eslint-disable-line no-underscore-dangle
          urlOrigin: req.headers.origin,
        };

        expect(apiUpdateSpy).toHaveBeenCalledWith(
          mockDeal._id,
          expectedUpdateObj,
        );

        // eslint-disable-next-line no-underscore-dangle
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
        _id: '1000023',
        facilitySnapshot: {
          _id: '1000023',
          associatedDealId: '12345678',
          mock: true,
        },
        tfm: {
          ukefExposure: { exposure: 'GBP 57.21', timestamp: '1614954617041' },
          facilityValueInGBP: 238.39322963227846,
        },
      };

      const mockDeal = {
        _id: '12345678',
        dealSnapshot: {
          _id: '12345678',
          mock: true,
        },
      };

      beforeEach(() => {
        api.getFacility = () => Promise.resolve(mockFacility);
        api.getDeal = () => Promise.resolve(mockDeal);
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


  describe('GET case parties', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getCaseParties(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/parties.njk', {
          deal: mockDeal.dealSnapshot,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          dealId: req.params._id,
          user: session.user,
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

        await caseController.getCaseParties(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET party edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
          submissionDetails: {
            supplierName: 'test supplier',
          },
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getExporterPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/exporter-edit.njk', {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: req.params._id,
          user: session.user,
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

        await caseController.getExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET case documents', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
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

        await caseController.getCaseDocuments(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET bond issuer edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
          submissionDetails: {
            supplierName: 'test supplier',
          },
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getBondIssuerPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/bonds-issuer-edit.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
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

        await caseController.getBondIssuerPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET bond beneficiary edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        dealSnapshot: {
          _id: '1000023',
          submissionDetails: {
            supplierName: 'test supplier',
          },
        },
        tfm: {
          parties: {
            exporter: {
              partyUrn: '12345',
            },
          },
        },
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await caseController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/edit/bonds-beneficiary-edit.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'parties',
            deal: mockDeal.dealSnapshot,
            user: session.user,
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

        await caseController.getBondBeneficiaryPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });


  describe('POST party edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            exporter: {
              partyUrn: '12345',
            },
          },
          session,
        };

        await caseController.postExporterPartyDetails(req, res);
        // eslint-disable-next-line no-underscore-dangle
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
          session,
        };

        await caseController.postExporterPartyDetails(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST bond edit', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render bond edit template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            facilityId: [1, 2],
            bondIssuerPartyUrn: [123, 234],
          },
          session,
        };

        await caseController.postTfmFacility(req, res);
        // eslint-disable-next-line no-underscore-dangle
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
