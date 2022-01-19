const {
  getFirstTask,
  getTaskInGroupById,
  getTaskInGroupByTitle,
  getGroupById,
  getGroupByTitle,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  groupHasAllTasksCompleted,
  taskIsCompletedImmediately,
  isAdverseHistoryTaskIsComplete,
  shouldUpdateDealStage,
} = require('./tasks');
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

  describe('getTaskInGroupById', () => {
    it('should return a task in a group', () => {
      const mockGroupTasks = [
        { id: 1 },
        { id: 2 },
      ];

      const result = getTaskInGroupById(mockGroupTasks, 2);
      expect(result).toEqual(mockGroupTasks[1]);
    });
  });

  describe('getTaskInGroupByTitle', () => {
    it('should return a task in a group', () => {
      const mockGroupTasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ];

      const result = getTaskInGroupByTitle(mockGroupTasks, 'Task 2');
      expect(result).toEqual(mockGroupTasks[1]);
    });
  });

  describe('getGroupById', () => {
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

      const result = getGroupById(mockTasks, 2);
      expect(result).toEqual(mockTasks[1]);
    });
  });

  describe('getGroupByTitle', () => {
    it('should return a group', () => {
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

      const result = getGroupByTitle(mockTasks, 'Group 2 tasks');
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

  describe('groupHasAllTasksCompleted', () => {
    it('returns true when all tasks are completed', () => {
      const mockGroupTasks = [
        {
          id: 1,
          title: 'mock',
          status: CONSTANTS.TASKS.STATUS.COMPLETED,
        },
      ];

      const result = groupHasAllTasksCompleted(mockGroupTasks);
      
      expect(result).toEqual(true);
    });

    it('returns false when tasks are NOT completed', () => {
      const mockGroupTasks = [
        {
          id: 1,
          title: 'mock',
          status: CONSTANTS.TASKS.STATUS.COMPLETED,
        },
        {
          id: 2,
          title: 'mock',
          status: CONSTANTS.TASKS.STATUS.TO_DO,
        },
      ];

      const result = groupHasAllTasksCompleted(mockGroupTasks);

      expect(result).toEqual(false);
    });
  });

  describe('taskIsCompletedImmediately', () => {
    it('should return true when status changes from `To do` to `Done`', () => {
      const result = taskIsCompletedImmediately(
        'To do',
        CONSTANTS.TASKS.STATUS.COMPLETED,
      );

      expect(result).toEqual(true);
    });

    it('should return false when status does NOT change from `To do` to `Done`', () => {
      const result = taskIsCompletedImmediately(
        'To do',
        'In progress',
      );

      expect(result).toEqual(false);
    });
  });

  describe('isAdverseHistoryTaskIsComplete', () => {
    const mockTasks = [
      {
        groupTitle: 'Group 1 tasks',
        id: 1,
        groupTasks: [],
      },
      {
        groupTitle: 'Adverse history check',
        id: 2,
        groupTasks: [
          {
            id: 1,
            title: 'Complete an adverse history check',
            status: CONSTANTS.TASKS.STATUS.COMPLETED,
          },
        ],
      },
    ];

    it('should return true when there is an adverse group and `adverse history check` task is completed', () => {
      const result = isAdverseHistoryTaskIsComplete(mockTasks);
      expect(result).toEqual(true);
    });

    it('should return false when there is no adverse group', () => {
      const tasksWithNoAdverseGroup = [
        mockTasks[0],
      ];

      const result = isAdverseHistoryTaskIsComplete(tasksWithNoAdverseGroup);
      expect(result).toEqual(false);
    });

    it('should return false when `adverse history check` task is not completed', () => {
      const tasksWithNoAdverseHistoryCheckTask = mockTasks;
      tasksWithNoAdverseHistoryCheckTask[1].groupTasks = [];

      const result = isAdverseHistoryTaskIsComplete(tasksWithNoAdverseHistoryCheckTask);
      expect(result).toEqual(false);
    });
  });

  describe('shouldUpdateDealStage', () => {
    const submissionType = 'Manual Inclusion Application';
    const taskId = '1';
    const groupid = 1;

    it('should return true when submissionType is MIA, is first task in first group, task status changes to `in progress`', () => {
      const statusFrom = 'To do';
      const statusTo = 'In progress';

      const result = shouldUpdateDealStage(
        submissionType,
        taskId,
        groupid,
        statusFrom,
        statusTo,
      );

      expect(result).toEqual(true);
    });

    it('should return true when submissionType is MIA, is first task in first group, task status changes from `To do` to `Done`', () => {
      const statusFrom = 'To do';
      const statusTo = CONSTANTS.TASKS.STATUS.COMPLETED;

      const result = shouldUpdateDealStage(
        submissionType,
        taskId,
        groupid,
        statusFrom,
        statusTo,
      );

      expect(result).toEqual(true);
    });

    it('should return false when a condition is not met', () => {
      const statusFrom = 'To do';
      const statusTo = 'To do';

      const result = shouldUpdateDealStage(
        submissionType,
        taskId,
        groupid,
        statusFrom,
        statusTo,
      );

      expect(result).toEqual(false);
    });
  });
});
