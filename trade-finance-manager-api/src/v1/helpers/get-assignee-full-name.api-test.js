const getAssigneeFullName = require('./get-assignee-full-name');
const MOCK_USERS = require('../__mocks__/mock-users');

describe('getAssigneeFullName', () => {
  it('should return user\'s full name', async () => {
    const mockUser = MOCK_USERS[0];
    const result = await getAssigneeFullName(mockUser._id);

    const { firstName, lastName } = mockUser;
    const expected = `${firstName} ${lastName}`;

    expect(result).toEqual(expected);
  });

  describe('when the given user id is `Unassigned`', () => {
    it('should return `Unassigned`', async () => {
      const result = await getAssigneeFullName('Unassigned');

      expect(result).toEqual('Unassigned');
    });
  });
});
