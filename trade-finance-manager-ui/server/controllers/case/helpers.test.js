/* eslint-disable no-underscore-dangle */
import {
  getGroup,
  getTask,
} from './helpers';

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
});

/* eslint-enable no-underscore-dangle */
