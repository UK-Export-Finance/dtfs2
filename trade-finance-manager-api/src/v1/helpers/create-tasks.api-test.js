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
        history: [],
      };

      expect(NEW_TASK).toEqual(expected);
    });
  });

  describe('createGroupTasks', () => {
    const mockGroupTasks = [
      {
        title: 'Title A',
        team: 'Team A',
      },
      {
        title: 'Title B',
        team: 'Team B',
      },
    ];

    const mockGroupTasksWithConditionalFlags = [
      { title: 'Task A', team: 'Test team' },
      { title: 'Task B', team: 'Test team', isConditional: true },
      { title: 'Task C', team: 'Test team' },
      { title: 'Task D', team: 'Test team', isConditional: true },
    ];

    it('should return array of tasks with incremented task id', () => {
      const result = createGroupTasks(mockGroupTasks, 2);

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
        const result = createGroupTasks(mockGroupTasks, 1);

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

    describe('when no additionalTasks are passed and a task has isConditional flag', () => {
      it('should NOT add isConditional tasks', () => {
        const mockGroupId = 1;

        const result = createGroupTasks(
          mockGroupTasksWithConditionalFlags,
          mockGroupId,
        );

        const conditionalTasks = mockGroupTasksWithConditionalFlags.filter((task) => task.isConditional === true);

        const conditionalTask1 = conditionalTasks[0];
        const conditionalTask2 = conditionalTasks[1];

        const conditionalTask1InResult = result.find((task) => task.title === conditionalTask1.title);
        expect(conditionalTask1InResult).toBeUndefined();

        const conditionalTask2InResult = result.find((task) => task.title === conditionalTask2.title);
        expect(conditionalTask2InResult).toBeUndefined();
      });
    });

    describe('when additionalTasks array of strings is passed', () => {
      it('should return any additional tasks (with isConditional flag) in a group that match a title in additionalTasks, retaining incremental task ids', () => {
        const mockGroupId = 1;

        const mockAdditionalTasks = [
          'Task B',
          'Task D',
        ];

        const result = createGroupTasks(
          mockGroupTasksWithConditionalFlags,
          mockGroupId,
          mockAdditionalTasks,
        );

        const expected = [
          {
            id: '1',
            groupId: mockGroupId,
            ...mockGroupTasksWithConditionalFlags[0],
            ...NEW_TASK,
            status: 'To do',
            canEdit: true,
          },
          {
            id: '2',
            groupId: mockGroupId,
            ...mockGroupTasksWithConditionalFlags[1],
            ...NEW_TASK,
          },
          {
            id: '3',
            groupId: mockGroupId,
            ...mockGroupTasksWithConditionalFlags[2],
            ...NEW_TASK,
          },
          {
            id: '4',
            groupId: mockGroupId,
            ...mockGroupTasksWithConditionalFlags[3],
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

    it('should return AIN tasks array with createGroupTasks and additionalTasks', () => {
      const mockAdditionalTasks = [
        CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
      ];

      const result = createTasksAIN(mockAdditionalTasks);

      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.AIN.GROUP_1.TASKS, 1, mockAdditionalTasks),
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

    it('should return MIA tasks array with createGroupTasks and additionalTasks', () => {
      const mockAdditionalTasks = [
        CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
      ];

      const result = createTasksMIA(mockAdditionalTasks);

      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_1.TASKS, 1, mockAdditionalTasks),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
          id: 2,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_2.TASKS, 2, mockAdditionalTasks),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
          id: 3,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_3.TASKS, 3, mockAdditionalTasks),
        },
        {
          groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
          id: 4,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_4.TASKS, 4, mockAdditionalTasks),
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
