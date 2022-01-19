const {
  previousTaskIsComplete,
  isTaskInUnderwritingGroup,
  taskCanBeEditedWithoutPreviousTaskComplete,
  handleTaskEditFlagAndStatus,
} = require('./tasks-edit-logic');
const MOCK_AIN_TASKS = require('../__mocks__/mock-AIN-tasks');
const MOCK_MIA_TASKS = require('../__mocks__/mock-MIA-tasks');
const CONSTANTS = require('../../constants');

describe('tasks edit logic', () => {
  describe('previousTaskIsComplete', () => {
    describe('when there is no previous task', () => {
      it('should return true', () => {
        const mockGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1 },
          ],
        };

        const result = previousTaskIsComplete(MOCK_AIN_TASKS, mockGroup, '1');
        expect(result).toEqual(true);
      });
    });

    describe('when the previous task has status `Done`', () => {
      it('should return true', () => {
        const mockGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'Done' },
            { id: '2', groupId: 1, status: 'To do' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = previousTaskIsComplete(MOCK_AIN_TASKS, mockGroup, '2');
        expect(result).toEqual(true);
      });
    });

    describe('when the group is not the first group and task id is first in the group', () => {
      const MOCK_SECOND_GROUP = {
        id: 2,
        groupTasks: [
          { id: '1', groupId: 2, status: 'To do' },
          { id: '2', groupId: 2, status: 'To do' },
          { id: '3', groupId: 2, status: 'To do' },
        ],
      };

      it('should return true when the previous group has all tasks completed', () => {
        const MOCK_AIN_TASKS_FIRST_GROUP_COMPLETED = [
          {
            groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
            id: 1,
            groupTasks: [
              {
                id: '1',
                groupId: 1,
                title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
                team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
                status: CONSTANTS.TASKS.STATUS.COMPLETED,
                assignedTo: {
                  userId: CONSTANTS.TASKS.UNASSIGNED,
                  userFullName: CONSTANTS.TASKS.UNASSIGNED,
                },
              },
              {
                id: '2',
                groupId: 1,
                title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
                team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
                status: CONSTANTS.TASKS.STATUS.COMPLETED,
                assignedTo: {
                  userId: CONSTANTS.TASKS.UNASSIGNED,
                  userFullName: CONSTANTS.TASKS.UNASSIGNED,
                },
              },
            ],
          },
          MOCK_SECOND_GROUP,
        ];

        const result = previousTaskIsComplete(
          MOCK_AIN_TASKS_FIRST_GROUP_COMPLETED,
          MOCK_SECOND_GROUP,
          '1',
        );
        expect(result).toEqual(true);
      });

      it('should return false if any task in the previous group is NOT completed', () => {
        const MOCK_AIN_TASKS_FIRST_GROUP_INCOMPLETE = [
          {
            groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
            id: 1,
            groupTasks: [
              {
                id: '1',
                groupId: 1,
                title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
                team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
                status: CONSTANTS.TASKS.STATUS.TO_DO,
                assignedTo: {
                  userId: CONSTANTS.TASKS.UNASSIGNED,
                  userFullName: CONSTANTS.TASKS.UNASSIGNED,
                },
              },
              {
                id: '2',
                groupId: 2,
                title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
                team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
                status: CONSTANTS.TASKS.STATUS.COMPLETED,
                assignedTo: {
                  userId: CONSTANTS.TASKS.UNASSIGNED,
                  userFullName: CONSTANTS.TASKS.UNASSIGNED,
                },
              },
            ],
          },
          MOCK_SECOND_GROUP,
        ];

        const result = previousTaskIsComplete(
          MOCK_AIN_TASKS_FIRST_GROUP_INCOMPLETE,
          MOCK_SECOND_GROUP,
          '1',
        );
        expect(result).toEqual(false);
      });
    });

    describe('when the previous task status is NOT `Done`', () => {
      it('should return false', () => {
        const mockGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'In progress' },
            { id: '2', groupId: 1, status: 'To do' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = previousTaskIsComplete(MOCK_AIN_TASKS, mockGroup, '3');
        expect(result).toEqual(false);
      });
    });
  });

  describe('isTaskInUnderwritingGroup', () => {
    describe('when task is in underwriting group', () => {
      it('should return true', () => {
        const underwritingGroup = MOCK_MIA_TASKS.find((group) =>
          group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING);

        const taskTitle = underwritingGroup.groupTasks[0].title;

        const result = isTaskInUnderwritingGroup(underwritingGroup, taskTitle);

        expect(result).toEqual(true);
      });
    });

    describe('when task is NOT in underwriting group', () => {
      it('should return false', () => {
        const underwritingGroup = MOCK_MIA_TASKS.find((group) =>
          group.groupTitle !== CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING);

        const taskTitle = 'Task title not in underwriting group';

        const result = isTaskInUnderwritingGroup(underwritingGroup, taskTitle);

        expect(result).toEqual(false);
      });
    });
  });

  describe('taskCanBeEditedWithoutPreviousTaskComplete', () => {
    describe('when the task\'s previousStatus is `completed`', () => {
      const mockGroup = {};
      const mockTask = {
        status: 'In progress',
        previousStatus: 'Done',
      };

      it('should return false', () => {
        const result = taskCanBeEditedWithoutPreviousTaskComplete(mockGroup, mockTask);
        expect(result).toEqual(false);
      });
    });

    describe('when the task\'s previousStatus is `cannot start`', () => {
      const mockGroup = {};
      const mockTask = {
        status: 'In progress',
        previousStatus: 'Cannot start yet',
      };

      it('should return false', () => {
        const result = taskCanBeEditedWithoutPreviousTaskComplete(mockGroup, mockTask);
        expect(result).toEqual(false);
      });
    });

    describe('when the task is NOT in underwriting group', () => {
      const mockGroup = {
        groupTitle: 'Not underwriting',
        groupTasks: [],
      };
      const mockTask = {
        status: 'In progress',
        previousStatus: 'To do',
      };

      it('should return false', () => {
        const result = taskCanBeEditedWithoutPreviousTaskComplete(mockGroup, mockTask);
        expect(result).toEqual(false);
      });
    });

    describe('when task.canEdit is false', () => {
      const mockGroup = {
        groupTitle: CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING,
        groupTasks: [],
      };
      const mockTask = {
        status: 'In progress',
        previousStatus: 'To do',
        canEdit: false,
      };

      it('should return false', () => {
        const result = taskCanBeEditedWithoutPreviousTaskComplete(mockGroup, mockTask);
        expect(result).toEqual(false);
      });
    });

    describe('when task.canEdit is true and is in underwriting group', () => {
      const mockGroup = {
        groupTitle: CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING,
        groupTasks: [
          { title: 'Mock underwriting task' },
        ],
      };

      const mockTask = {
        status: 'In progress',
        previousStatus: 'To do',
        title: 'Mock underwriting task',
        canEdit: true,
      };

      it('should return true', () => {
        const result = taskCanBeEditedWithoutPreviousTaskComplete(mockGroup, mockTask);
        expect(result).toEqual(true);
      });
    });
  });

  describe('handleTaskEditFlagAndStatus', () => {
    describe(`when isTaskThatIsBeingUpdated flag is false and the task status is ${CONSTANTS.TASKS.STATUS.COMPLETED}`, () => {
      it('should return the task', () => {
        const mockTaskGroups = [];
        const mockGroup = {
          groupTasks: [
            { id: '1', groupId: 1, status: CONSTANTS.TASKS.STATUS.COMPLETED },
            { id: '2', groupId: 1, status: CONSTANTS.TASKS.STATUS.TODO },
          ],
        };
        const mockTask = {
          id: 2, groupId: 1, status: CONSTANTS.TASKS.STATUS.COMPLETED,
        };
        const isTaskThatIsBeingUpdated = false;

        const result = handleTaskEditFlagAndStatus(
          mockTaskGroups,
          mockGroup,
          mockTask,
          isTaskThatIsBeingUpdated,
        );

        const expected = {
          updatedTask: mockTask,
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when the previous task is completed', () => {
      const mockTaskGroups = [];
      const mockGroup = {
        groupTasks: [
          { id: '1', groupId: 1, status: CONSTANTS.TASKS.STATUS.COMPLETED },
          { id: '2', groupId: 1, status: CONSTANTS.TASKS.STATUS.IN_PROGRESS },
        ],
      };
      const mockTask = {
        id: '2', groupId: 1, status: CONSTANTS.TASKS.STATUS.COMPLETED,
      };

      describe('when isTaskThatIsBeingUpdated', () => {
        const isTaskThatIsBeingUpdated = true;

        it('should return the task', () => {
          const result = handleTaskEditFlagAndStatus(
            mockTaskGroups,
            mockGroup,
            mockTask,
            isTaskThatIsBeingUpdated,
          );

          const expected = mockTask;

          expect(result.updatedTask).toEqual(expected);
        });

        describe(`when status is ${CONSTANTS.TASKS.STATUS.COMPLETED}`, () => {
          mockTask.status = CONSTANTS.TASKS.STATUS.COMPLETED;

          it('should return the task with canEdit as false', () => {
            const result = handleTaskEditFlagAndStatus(
              mockTaskGroups,
              mockGroup,
              mockTask,
              isTaskThatIsBeingUpdated,
            );

            const expected = {
              ...mockTask,
              canEdit: false,
            };

            expect(result.updatedTask).toEqual(expected);
          });
        });
      });

      describe('when isTaskThatIsBeingUpdated is false', () => {
        const isTaskThatIsBeingUpdated = false;

        describe(`when task status is ${CONSTANTS.TASKS.STATUS.CANNOT_START}`, () => {
          it(`should unlock the task with canEdit = true and ${CONSTANTS.TASKS.STATUS.TO_DO} status`, () => {
            mockTask.status = CONSTANTS.TASKS.STATUS.CANNOT_START;
            mockTask.canEdit = false;

            const result = handleTaskEditFlagAndStatus(
              mockTaskGroups,
              mockGroup,
              mockTask,
              isTaskThatIsBeingUpdated,
            );

            const expected = {
              ...mockTask,
              canEdit: true,
              status: CONSTANTS.TASKS.STATUS.TO_DO,
            };

            expect(result.updatedTask).toEqual(expected);
          });

          it('should return sendEmail flag', () => {
            mockTask.status = CONSTANTS.TASKS.STATUS.CANNOT_START;
            const result = handleTaskEditFlagAndStatus(
              mockTaskGroups,
              mockGroup,
              mockTask,
              isTaskThatIsBeingUpdated,
            );

            expect(result.sendEmail).toEqual(true);
          });
        });
      });
    });

    describe('when the previous task is NOT completed and the task can be edited without previous task completed', () => {
      const mockGroup = {
        groupTitle: CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING,
        groupTasks: [
          {
            id: '1',
            groupId: 1,
            status: CONSTANTS.TASKS.STATUS.TO_DO,
            canEdit: true,
          },
          {
            id: '2',
            groupId: 1,
            status: CONSTANTS.TASKS.STATUS.CANNOT_START,
            canEdit: false,
          },
          {
            id: '3',
            groupId: 1,
            status: CONSTANTS.TASKS.STATUS.CANNOT_START,
            canEdit: false,
          },
        ],
      };

      const mockTaskGroups = [mockGroup];

      const mockTask = {
        id: '3', groupId: 1, status: CONSTANTS.TASKS.STATUS.TO_DO, canEdit: true,
      };

      it(`should unlock the task with canEdit = true and ${CONSTANTS.TASKS.STATUS.TO_DO} status`, () => {
        const isTaskThatIsBeingUpdated = false;

        const result = handleTaskEditFlagAndStatus(
          mockTaskGroups,
          mockGroup,
          mockTask,
          isTaskThatIsBeingUpdated,
        );

        const expected = {
          ...mockTask,
          canEdit: true,
          status: CONSTANTS.TASKS.STATUS.TO_DO,
        };

        expect(result.updatedTask).toEqual(expected);
      });

      describe(`when isTaskThatIsBeingUpdated task has ${CONSTANTS.TASKS.STATUS.COMPLETED} status`, () => {
        it('should add canEdit = false flag', () => {
          const isTaskThatIsBeingUpdated = true;
          mockTask.status = CONSTANTS.TASKS.STATUS.COMPLETED;
          mockTask.canEdit = true;

          const result = handleTaskEditFlagAndStatus(
            mockTaskGroups,
            mockGroup,
            mockTask,
            isTaskThatIsBeingUpdated,
          );

          expect(result.updatedTask.canEdit).toEqual(false);
        });
      });
    });
  });
});
