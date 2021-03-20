import helpers from './helpers';

const {
  getTask,
  isTaskIsAssignedToUser,
  userFullName,
} = helpers;

describe('case - helpers', () => {
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
      const mockTaskAssignedTo = { userId: 1 };
      const result = isTaskIsAssignedToUser(mockTaskAssignedTo, 1);
      expect(result).toEqual(true);
    });

    it('should return false when taskAssignedTo does NOT match userId', () => {
      const mockTaskAssignedTo = { userId: 1 };
      const result = isTaskIsAssignedToUser(mockTaskAssignedTo, 2);
      expect(result).toEqual(false);
    });
  });

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
});
