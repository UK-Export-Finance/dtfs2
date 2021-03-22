/* eslint-disable no-underscore-dangle */
import helpers from './helpers';

const {
  userFullName,
  getTask,
  isTaskIsAssignedToUser,
  getTeamMembersWithoutCurrentUser,
  mapTeamMembersSelectOptions,
  mapAssignToSelectOptions,
} = helpers;

describe('case - helpers', () => {
  describe('userFullName', () => {
    it('should return first and last name', () => {
      const mockUser = {
        firstName: 'Test',
        lastName: 'testing',
      };
      const result = userFullName(mockUser);

      const expected = `${mockUser.firstName} ${mockUser.lastName}`;
      expect(result).toEqual(expected);
    });
  });

  describe('getTask', () => {
    it('should return task by id', () => {
      const mockTasks = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ];
      const result = getTask(3, mockTasks);
      expect(result).toEqual(mockTasks[2]);
    });
  });

  describe('isTaskIsAssignedToUser', () => {
    it('should return true when taskAssignedTo matches userId', () => {
      const mockTaskAssignedTo = '1';
      const result = isTaskIsAssignedToUser(mockTaskAssignedTo, '1');
      expect(result).toEqual(true);
    });

    it('should return false when taskAssignedTo does NOT match userId', () => {
      const mockTaskAssignedTo = '1';
      const result = isTaskIsAssignedToUser(mockTaskAssignedTo, '2');
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
    it('should return mapped options', () => {
      const mockTask = {
        title: 'Mock',
        assignedTo: {
          userId: '100',
        },
      };

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

      const result = mapAssignToSelectOptions(mockTask, mockCurrentUser, mockTeamMembers);
      const expected = [
        {
          value: 'Unassigned',
          text: 'Unassigned',
          selected: false,
        },
        {
          value: mockCurrentUser._id,
          text: `${userFullName(mockCurrentUser)} (Assign to me)`,
          selected: isTaskIsAssignedToUser(mockTask.assignedTo.userId, mockCurrentUser._id),
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

/* eslint-enable no-underscore-dangle */
