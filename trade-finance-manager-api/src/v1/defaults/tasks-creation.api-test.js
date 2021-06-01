const CONSTANTS = require('../../constants');
const {
  taskDefaults,
  createGroupTasks,
  TASKS,
} = require('./tasks');

describe('defaults - tasks creation', () => {
  describe('taskDefaults', () => {
    it('should return object with `to do` status and unassigned assignedTo object', () => {
      const result = taskDefaults();
      const expected = {
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
        canEdit: false,
      };

      expect(result).toEqual(expected);
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

    it('should return array of tasks with given task id and groupId', () => {
      const result = createGroupTasks(mockTasks, 2);

      const expected = [
        {
          id: '1',
          groupId: 2,
          title: 'Title A',
          team: 'Team A',
          ...taskDefaults(),
        },
        {
          id: '2',
          groupId: 2,
          title: 'Title B',
          team: 'Team B',
          ...taskDefaults(),
        },
      ];

      expect(result).toEqual(expected);
    });

    describe('when the given groupId is 1', () => {
      it('should add `canEdit` to the first task', () => {
        const result = createGroupTasks(mockTasks, 1);

        const expected = [
          {
            id: '1',
            groupId: 1,
            title: 'Title A',
            team: 'Team A',
            ...taskDefaults(),
            status: 'To do',
            canEdit: true,
          },
          {
            id: '2',
            groupId: 1,
            title: 'Title B',
            ...taskDefaults(),
            team: 'Team B',
          },
        ];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('TASKS', () => {
    it('should return AIN tasks', () => {
      const expected = [
        {
          groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
          id: 1,
          groupTasks: createGroupTasks(CONSTANTS.TASKS.AIN.GROUP_1.TASKS, 1),
        },
      ];

      expect(TASKS.AIN).toEqual(expected);
    });

    it('should return MIA tasks', () => {
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

      expect(TASKS.MIA).toEqual(expected);
    });
  });
});
