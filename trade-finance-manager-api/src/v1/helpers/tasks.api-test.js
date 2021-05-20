const {
  getFirstTask,
} = require('./tasks');

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
});
