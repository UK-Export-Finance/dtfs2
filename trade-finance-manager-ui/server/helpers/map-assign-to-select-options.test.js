import mapAssignToSelectOptions from './map-assign-to-select-options';
import {
  userFullName,
} from './user';
import { mapTeamMembersSelectOptions } from './team';

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

      const result = mapAssignToSelectOptions(
        mockTask.assignedTo.userId,
        mockCurrentUser,
        mockTeamMembers,
      );
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

      const result = mapAssignToSelectOptions(
        mockTask.assignedTo.userId,
        mockCurrentUser,
        mockTeamMembers,
      );
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

      const result = mapAssignToSelectOptions(
        mockTask.assignedTo.userId,
        mockCurrentUser,
        mockTeamMembers,
      );
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
