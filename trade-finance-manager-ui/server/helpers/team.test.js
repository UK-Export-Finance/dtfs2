/* eslint-disable no-underscore-dangle */
import {
  getTeamMembersWithoutCurrentUser,
  mapTeamMembersSelectOptions,
} from './team';

import { userFullName } from './user';

describe('team - helpers', () => {
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
});

/* eslint-enable no-underscore-dangle */
