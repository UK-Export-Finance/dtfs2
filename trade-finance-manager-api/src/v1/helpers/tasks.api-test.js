const {
  getFirstTask,
  getTask,
  getGroup,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  previousTaskIsComplete,
  firstTaskIsComplete,
  isFirstTask,
  canUpdateTask,
} = require('./tasks');

const MOCK_AIN_TASKS = require('../__mocks__/mock-AIN-tasks');
const CONSTANTS = require('../../constants');

describe('helpers - tasks', () => {
  describe('getFirstTask', () => {
    it('should return the first task', () => {
      const mockTasks = [
        {
          groupTitle: 'Testing',
          groupTasks: [
            { id: 1 },
            { id: 2 },
          ],
        },
      ];

      const expected = mockTasks[0].groupTasks[0];
      expect(getFirstTask(mockTasks)).toEqual(expected);
    });
  });

  describe('getTask', () => {
    it('should return task by id', () => {
      const mockGroupTasks = [
        { id: '1', groupId: 1 },
        { id: '2', groupId: 1 },
        { id: '3', groupId: 1 },
      ];

      const result = getTask('2', mockGroupTasks);
      expect(result).toEqual(mockGroupTasks[1]);
    });
  });

  describe('getGroup', () => {
    it('should return a group by id', () => {
      const mockTasks = [
        {
          groupTitle: 'Group 1 tasks',
          id: 1,
          groupTasks: [],
        },
        {
          groupTitle: 'Group 2 tasks',
          id: 2,
          groupTasks: [],
        },
      ];

      const result = getGroup(mockTasks, 2);
      expect(result).toEqual(mockTasks[1]);
    });
  });

  describe('isFirstTaskInAGroup', () => {
    it('returns true when task id is 1 and group id is greater than 1', () => {
      const result = isFirstTaskInAGroup('1', 2);
      expect(result).toEqual(true);
    });

    it('returns false when task id is NOT 1', () => {
      const result = isFirstTaskInAGroup('2', 2);
      expect(result).toEqual(false);
    });

    it('returns false when group id is 1', () => {
      const result = isFirstTaskInAGroup('1', 1);
      expect(result).toEqual(false);
    });
  });

  describe('isFirstTaskInFirstGroup', () => {
    it('returns true when task id and group id is 1', () => {
      const result = isFirstTaskInFirstGroup('1', 1);
      expect(result).toEqual(true);
    });

    it('returns false when task id is NOT 1', () => {
      const result = isFirstTaskInFirstGroup('2', 1);
      expect(result).toEqual(false);
    });

    it('returns false when group id is NOT 1', () => {
      const result = isFirstTaskInFirstGroup('1', 2);
      expect(result).toEqual(false);
    });
  });

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
      it('should return true when the previous group\'s last task has `Done` status', () => {
        const MOCK_SECOND_GROUP = {
          id: 2,
          groupTasks: [
            { id: '1', groupId: 2, status: 'To do' },
            { id: '2', groupId: 2, status: 'To do' },
            { id: '3', groupId: 2, status: 'To do' },
          ],
        };

        const MOCK_AIN_TASKS_FIRST_GROUP_COMPLETED = [
          {
            groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
            id: 1,
            groupTasks: [
              {
                id: '1',
                groupId: 1,
                title: CONSTANTS.TASKS.AIN.GROUP_1.MATCH_OR_CREATE_PARTIES,
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
                title: CONSTANTS.TASKS.AIN.GROUP_1.CREATE_OR_LINK_SALESFORCE,
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

  describe('firstTaskIsComplete', () => {
    describe('when the first task has status `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', groupId: 1, status: 'Done' },
          { id: '2', groupId: 1, status: 'To do' },
          { id: '3', groupId: 1, status: 'To do' },
        ];

        const result = firstTaskIsComplete(mockGroupTasks);
        expect(result).toEqual(true);
      });
    });

    describe('when the first task status is NOT `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', groupId: 1, status: 'In progress' },
          { id: '2', groupId: 1, status: 'To do' },
          { id: '3', groupId: 1, status: 'To do' },
        ];

        const result = firstTaskIsComplete(mockGroupTasks);
        expect(result).toEqual(false);
      });
    });
  });

  describe('isFirstTask', () => {
    describe('when taskId is `1`', () => {
      it('should return true', () => {
        const result = isFirstTask('1');
        expect(result).toEqual(true);
      });
    });

    describe('when taskId is NOT `1`', () => {
      it('should return false', () => {
        const result = isFirstTask('2');
        expect(result).toEqual(false);
      });
    });
  });

  describe('canUpdateTask', () => {
    describe('when previous task is complete', () => {
      it('should return true', () => {
        const mockParentGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'Done' },
            { id: '2', groupId: 1, status: 'Done' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = canUpdateTask(MOCK_AIN_TASKS, mockParentGroup, '3');

        expect(result).toEqual(true);
      });
    });


    describe('when previous task is NOT complete', () => {
      it('should return false', () => {
        const mockParentGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'Done' },
            { id: '2', groupId: 1, status: 'To do' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = canUpdateTask(MOCK_AIN_TASKS, mockParentGroup, '3');

        expect(result).toEqual(false);
      });
    });
  });
});
