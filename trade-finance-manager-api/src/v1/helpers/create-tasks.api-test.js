const CONSTANTS = require('../../constants');
const {
  NEW_TASK,
  createGroupTasks,
  createTasksAIN,
  createTasksMIA,
  createTasks,
} = require('./create-tasks');

describe('defaults - tasks creation', () => {
  describe('NEW_TASK', () => {
    it('should return object with `to do` status and unassigned assignedTo object', () => {
      const expected = {
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
        canEdit: false,
      };

      expect(NEW_TASK).toEqual(expected);
    });
  });

  describe('createGroupTasks', () => {
    const mockTasks = [
      {
        title: 'Title A',
        team: 'Team A',
      },
      {
        title: 'Title B',
        team: 'Team B',
      },
    ];

    it('should return array of tasks with incremented task id', () => {
      const result = createGroupTasks(mockTasks, 2);

      const expected = [
        {
          id: '1',
          groupId: 2,
          title: 'Title A',
          team: 'Team A',
          ...NEW_TASK,
        },
        {
          id: '2',
          groupId: 2,
          title: 'Title B',
          team: 'Team B',
          ...NEW_TASK,
        },
      ];

      expect(result).toEqual(expected);
    });

    describe('when the given groupId is 1', () => {
      it('should add `canEdit` to the first task in group 1', () => {
        const result = createGroupTasks(mockTasks, 1);

        const expected = [
          {
            id: '1',
            groupId: 1,
            title: 'Title A',
            team: 'Team A',
            ...NEW_TASK,
            status: 'To do',
            canEdit: true,
          },
          {
            id: '2',
            groupId: 1,
            title: 'Title B',
            ...NEW_TASK,
            team: 'Team B',
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when excludedTasks array of strings is passed', () => {
      it('should NOT return any tasks in a group that match a title in excludedTasks, retaining incremental task ids', () => {
        const mockGroupTasks = [
          { title: 'Task A', team: 'Test team' },
          { title: 'Task B', team: 'Test team' },
          { title: 'Task C', team: 'Test team' },
          { title: 'Task D', team: 'Test team' },
        ];

        const mockGroupId = 1;

        const mockExcludedTasks = [
          'Task B',
          'Task C',
        ];

        const result = createGroupTasks(mockGroupTasks, mockGroupId, mockExcludedTasks);

        const expected = [
          {
            id: '1',
            groupId: 1,
            title: 'Task A',
            team: 'Test team',
            ...NEW_TASK,
            status: 'To do',
            canEdit: true,
          },
          {
            id: '2',
            groupId: 1,
            title: 'Task D',
            team: 'Test team',
            ...NEW_TASK,
          },
        ];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('createTasksAIN', () => {
    it('should return AIN tasks array with createGroupTasks', () => {
      const result = createTasksAIN();

      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.AIN.GROUP_1.TASKS, 1),
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should return AIN tasks array with createGroupTasks and excludedTasks', () => {
      const mockExcludedTasks = [
        CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE
      ];

      const result = createTasksAIN(mockExcludedTasks);

      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.AIN.GROUP_1.TASKS, 1, mockExcludedTasks),
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('createTasksMIA', () => {
    it('should return MIA tasks array with createGroupTasks', () => {
      const result = createTasksMIA();

      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_1.TASKS, 1),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
          id: 2,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_2.TASKS, 2),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
          id: 3,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_3.TASKS, 3),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
          id: 4,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_4.TASKS, 4),
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should return MIA tasks array with createGroupTasks and excludedTasks', () => {
      const mockExcludedTasks = [
        CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES
      ];

      const result = createTasksMIA(mockExcludedTasks);

      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_1.TASKS, 1, mockExcludedTasks),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
          id: 2,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_2.TASKS, 2, mockExcludedTasks),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
          id: 3,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_3.TASKS, 3, mockExcludedTasks),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
          id: 4,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_4.TASKS, 4, mockExcludedTasks),
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('createTasks', () => {
    describe('when submissionType is AIN', () => {
      it('should return AIN tasks', () => {
        const result = createTasks(CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);

        const expected = createTasksAIN();
        expect(result).toEqual(expected);
      });
    });

    describe('when submissionType is MIA', () => {
      it('should return MIA tasks', () => {
        const result = createTasks(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);

        const expected = createTasksMIA();
        expect(result).toEqual(expected);
      });
    });    
  });
});
