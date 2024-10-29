const { mapAndFilter, filterTeamTasksInGroup, filterTeamTasks, filterUserTasksInGroup, filterUserTasks, filterTasks } = require('./filterTasks');

describe('filterTasks', () => {
  const MOCK_USER_ID = '12345678';
  const MOCK_TEAM_ID = 'TEAM1';

  const mockTasks = [
    {
      groupTitle: 'Group of tasks A',
      groupTasks: [
        {
          id: '1',
          title: 'Task A',
          team: {
            id: MOCK_TEAM_ID,
            name: 'Team 1',
          },
          status: 'To do',
          assignedTo: {
            userId: 'Unassigned',
            userFullName: 'Unassigned',
          },
        },
        {
          id: '2',
          title: 'Task B',
          team: {
            id: 'TEAM2',
            name: 'Team 2',
          },
          status: 'To do',
          assignedTo: {
            userId: MOCK_USER_ID,
            userFullName: 'Mock name',
          },
        },
      ],
    },
  ];

  const mockEmptyTasks = [];

  describe('mapAndFilter function', () => {
    const mockArgsFunc = (task, group) => {
      if (task.id === '2') {
        return {
          ...group,
          groupTasks: [task],
        };
      }

      return group;
    };

    it.each([null, undefined, {}, []])('should return empty array when tasks are empty', (invalidTasks) => {
      const result = mapAndFilter(invalidTasks, mockArgsFunc, MOCK_TEAM_ID);

      expect(result).toEqual([]);
    });

    it('should return tasks filtered by the given function via params', () => {
      const result = mapAndFilter(mockTasks, mockArgsFunc, MOCK_TEAM_ID);

      const mockTasksThatDoNotHaveTaskId1 = [
        {
          groupTitle: mockTasks[0].groupTitle,
          groupTasks: [
            {
              ...mockTasks[0].groupTasks[1],
            },
          ],
        },
      ];

      const expected = mockTasksThatDoNotHaveTaskId1;
      expect(result).toEqual(expected);
    });
  });

  describe('filter tasks by team', () => {
    describe('filterTeamTasksInGroup', () => {
      const mockTask = {
        id: '1',
        title: 'Task A',
        team: {
          id: MOCK_TEAM_ID,
          name: ' Team 1',
        },
        status: 'To do',
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      };

      it("should return task group with task, if the filter value matches the task's team id", () => {
        const mockFilteredGroup = {
          groupTitle: 'Test',
          groupTasks: [],
        };

        const FILTER_VALUE = MOCK_TEAM_ID;

        const result = filterTeamTasksInGroup(mockTask, mockFilteredGroup, FILTER_VALUE);

        const expected = {
          ...mockFilteredGroup,
          groupTasks: [mockTask],
        };

        expect(result).toEqual(expected);
      });

      it("should NOT return task group with task when a given task's team id does NOT match the given filter value", () => {
        const mockFilteredGroup = {
          groupTitle: 'Test',
          groupTasks: [],
        };

        const FILTER_VALUE = 'FAKE_TEAM';

        const result = filterTeamTasksInGroup(mockTask, mockFilteredGroup, FILTER_VALUE);

        const expected = {
          ...mockFilteredGroup,
          groupTasks: [],
        };

        expect(result).toEqual(expected);
      });
    });

    describe('filterTeamTasks function', () => {
      it('should return result of mapAndFilter with filterTeamTasksInGroup', () => {
        const FILTER_TEAM_ID = MOCK_TEAM_ID;

        const result = filterTeamTasks(mockTasks, FILTER_TEAM_ID);

        const expected = mapAndFilter(mockTasks, filterTeamTasksInGroup, FILTER_TEAM_ID);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('filter tasks by user', () => {
    describe('filterUserTasksInGroup', () => {
      const mockTask = {
        id: '1',
        title: 'Task A',
        team: {
          id: MOCK_TEAM_ID,
          name: ' Team 1',
        },
        status: 'To do',
        assignedTo: {
          userId: MOCK_USER_ID,
          userFullName: 'Mock name',
        },
      };

      it("should return task group with task, if the filter value matches the task's assigned userId", () => {
        const mockFilteredGroup = {
          groupTitle: 'Test',
          groupTasks: [],
        };

        const FILTER_VALUE = MOCK_USER_ID;

        const result = filterUserTasksInGroup(mockTask, mockFilteredGroup, FILTER_VALUE);

        const expected = {
          ...mockFilteredGroup,
          groupTasks: [mockTask],
        };

        expect(result).toEqual(expected);
      });

      it("should NOT return task group with task when a given task's assigned userId does NOT match the given filter value", () => {
        const mockFilteredGroup = {
          groupTitle: 'Test',
          groupTasks: [],
        };

        const FILTER_VALUE = '123';

        const result = filterUserTasksInGroup(mockTask, mockFilteredGroup, FILTER_VALUE);

        const expected = {
          ...mockFilteredGroup,
          groupTasks: [],
        };

        expect(result).toEqual(expected);
      });
    });

    describe('filterUserTasks function', () => {
      it('should return result of mapAndFilter with filterUserTasksInGroup', () => {
        const FILTER_USER_ID = MOCK_USER_ID;

        const result = filterUserTasks(mockTasks, FILTER_USER_ID);

        const expected = mapAndFilter(mockTasks, filterUserTasksInGroup, FILTER_USER_ID);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('filterTasks function', () => {
    describe('when there are no tasks', () => {
      it('should return empty array back when there are no tasks', () => {
        const mockFiltersObj = {};

        const result = filterTasks(mockEmptyTasks, mockFiltersObj);
        expect(result).toEqual([]);
      });

      it('should return empty array back when tasks are null', () => {
        const mockFiltersObj = {};

        const result = filterTasks(null, mockFiltersObj);
        expect(result).toEqual([]);
      });

      it('should return empty array back when tasks is undefined', () => {
        const mockFiltersObj = {};

        const result = filterTasks(undefined, mockFiltersObj);
        expect(result).toEqual([]);
      });
    });

    describe('when there is no filterType', () => {
      it('should return all tasks', () => {
        const mockFiltersObj = {};

        const result = filterTasks(mockTasks, mockFiltersObj);
        expect(result).toEqual(mockTasks);
      });
    });

    describe('when filterType is `all`', () => {
      it('should return all tasks', () => {
        const mockFiltersObj = {
          filterType: 'all',
        };

        const result = filterTasks(mockTasks, mockFiltersObj);
        expect(result).toEqual(mockTasks);
      });
    });

    describe('when filterType is `team`', () => {
      it('should return result of filterTeamTasks', () => {
        const mockFiltersObj = {
          filterType: 'team',
          teamId: MOCK_TEAM_ID,
        };

        const result = filterTasks(mockTasks, mockFiltersObj);
        const expected = filterTeamTasks(mockTasks, mockFiltersObj.teamId);
        expect(result).toEqual(expected);
      });
    });

    describe('when filterType is `user`', () => {
      it('should return result of filterUserTasks', () => {
        const mockFiltersObj = {
          filterType: 'user',
          userId: MOCK_USER_ID,
        };

        const result = filterTasks(mockTasks, mockFiltersObj);
        const expected = filterUserTasks(mockTasks, mockFiltersObj.userId);
        expect(result).toEqual(expected);
      });
    });
  });
});
