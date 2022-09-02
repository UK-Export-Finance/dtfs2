const mapTaskHistoryObject = require('./map-task-history-object');
const MOCK_USERS = require('../__mocks__/mock-users');

const mockUser = MOCK_USERS[0];

describe('mapTaskHistoryObject', () => {
  it('should return mapped object with timestamp', () => {
    const input = {
      statusFrom: 'To do',
      statusTo: 'Done',
      assignedUserId: mockUser._id,
      updatedBy: mockUser._id,
    };

    const result = mapTaskHistoryObject(input);

    expect(result.statusFrom).toEqual(input.statusFrom);
    expect(result.statusTo).toEqual(input.statusTo);
    expect(result.assignedUserId).toEqual(input.assignedUserId);
    expect(result.updatedBy).toEqual(input.updatedBy);
    expect(typeof result.timestamp).toEqual('number');
  });
});
