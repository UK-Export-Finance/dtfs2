/* eslint-disable no-underscore-dangle */
import helpers from './helpers';
import userHelpers from '../../helpers/user';

const {
  getGroup,
  getTask,
  isTaskAssignedToUser,
  getTeamMembersWithoutCurrentUser,
  mapTeamMembersSelectOptions,
  mapAssignToSelectOptions,
} = helpers;

const { userFullName } = userHelpers;

describe('case - helpers', () => {
  describe('getGroup', () => {
    it('should return group by id', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      ];

      const result = getGroup(1, mockTasks);
      expect(result).toEqual(mockTasks[0]);
    });
  });

  describe('getTask', () => {
    it('should return task by groupId and taskId', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      ];
      const result = getTask(1, 3, mockTasks);
      expect(result).toEqual(mockTasks[0].groupTasks[2]);
    });

    it('should return null when group does not exist', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [],
        },
      ];
      const result = getTask(2, 1, mockTasks);
      expect(result).toEqual(null);
    });

    it('should return null when task does not exist', () => {
      const mockTasks = [
        {
          id: 1,
          groupTasks: [{ id: 1 }],
        },
      ];
      const result = getTask(1, 2, mockTasks);
      expect(result).toEqual(null);
    });
  });

  describe('isTaskAssignedToUser', () => {
    it('should return true when taskAssignedTo matches userId', () => {
      const mockTaskAssignedTo = '1';
      const result = isTaskAssignedToUser(mockTaskAssignedTo, '1');
      expect(result).toEqual(true);
    });

    it('should return false when taskAssignedTo does NOT match userId', () => {
      const mockTaskAssignedTo = '1';
      const result = isTaskAssignedToUser(mockTaskAssignedTo, '2');
      expect(result).toEqual(false);
    });
  });

  describe('getTeamMembersWithoutCurrentUser', () => {
    it('should return all members except for the given id', () => {
      const mockTeamMembers = [
        { _id: '1' },
        { _id: '2' },
        { _id: '3' },
        { _id: '100' },
      ];

      const result = getTeamMembersWithoutCurrentUser(mockTeamMembers, '100');
      expect(result).toEqual([
        { _id: '1' },
        { _id: '2' },
        { _id: '3' },
      ]);
    });
  });

  describe('mapTeamMembersSelectOptions', () => {
    it('should return mapped team members', () => {
      const mockTeamMembers = [
        { _id: '1', firstName: 'a', lastName: 'b' },
        { _id: '2', firstName: 'a', lastName: 'b' },
        { _id: '100', firstName: 'a', lastName: 'b' },
      ];

      const mockTaskAssignedTo = '2';
      const mockCurrentUserId = '100';

      const result = mapTeamMembersSelectOptions(
        mockTeamMembers,
        mockTaskAssignedTo,
        mockCurrentUserId,
      );

      const expected = [
        {
          value: mockTeamMembers[0]._id,
          text: userFullName(mockTeamMembers[0]),
          selected: false,
        },
        {
          value: mockTeamMembers[1]._id,
          text: userFullName(mockTeamMembers[1]),
          selected: true,
        },
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('mapAssignToSelectOptions', () => {
    const mockCurrentUser = {
      firstName: 'Test',
      lastName: 'testing',
      _id: '100',
    };

    const mockTeamMembers = [
      { _id: '1', firstName: 'a', lastName: 'b' },
      { _id: '2', firstName: 'a', lastName: 'b' },
      { _id: '100', firstName: 'a', lastName: 'b' },
    ];

    describe('when task is assigned to someone that is not the current logged in user', () => {
      it('should return mapped options in correct order', () => {
        const mockTask = {
          title: 'Mock',
          assignedTo: {
            userId: '1',
          },
        };

        const result = mapAssignToSelectOptions(mockTask, mockCurrentUser, mockTeamMembers);
        const expected = [
          {
            value: mockCurrentUser._id,
            text: `${userFullName(mockCurrentUser)} (Assign to me)`,
            selected: false,
          },
          {
            value: 'Unassigned',
            text: 'Unassigned',
            selected: false,
          },
          ...mapTeamMembersSelectOptions(
            mockTeamMembers,
            mockTask.assignedTo.userId,
            mockCurrentUser._id,
          ),
        ];
        expect(result).toEqual(expected);
      });
    });

    describe('when task is unassigned', () => {
      it('should return mapped options in correct order', () => {
        const mockTask = {
          title: 'Mock',
          assignedTo: {
            userId: 'Unassigned',
          },
        };

        const result = mapAssignToSelectOptions(mockTask, mockCurrentUser, mockTeamMembers);
        const expected = [
          {
            value: 'Unassigned',
            text: 'Unassigned',
            selected: true,
          },
          {
            value: mockCurrentUser._id,
            text: `${userFullName(mockCurrentUser)} (Assign to me)`,
            selected: false,
          },
          ...mapTeamMembersSelectOptions(
            mockTeamMembers,
            mockTask.assignedTo.userId,
            mockCurrentUser._id,
          ),
        ];
        expect(result).toEqual(expected);
      });
    });
    describe('when task is assigned to current logged in user', () => {
      it('should return mapped options in correct order', () => {
        const mockTask = {
          title: 'Mock',
          assignedTo: {
            userId: mockCurrentUser._id,
          },
        };

        const result = mapAssignToSelectOptions(mockTask, mockCurrentUser, mockTeamMembers);
        const expected = [
          {
            value: 'Unassigned',
            text: 'Unassigned',
            selected: false,
          },
          {
            value: mockCurrentUser._id,
            text: userFullName(mockCurrentUser),
            selected: true,
          },
          ...mapTeamMembersSelectOptions(
            mockTeamMembers,
            mockTask.assignedTo.userId,
            mockCurrentUser._id,
          ),
        ];
        expect(result).toEqual(expected);
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
