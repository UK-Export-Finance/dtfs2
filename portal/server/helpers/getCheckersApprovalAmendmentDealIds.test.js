const getCheckersApprovalAmendmentDealIds = require('./getCheckersApprovalAmendmentDealIds');
const api = require('../api');

jest.mock('../api');

const userToken = 'test-token';
const mockAmendmentsCheckersApproval = [{ dealId: 'deal1' }, { dealId: 'deal2' }, { dealId: 'deal3' }];
console.error = jest.fn();

describe('getCheckersApprovalAmendmentDealIds', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return deal IDs when amendments are provided', async () => {
    api.getAllAmendments.mockResolvedValue(mockAmendmentsCheckersApproval);

    const result = await getCheckersApprovalAmendmentDealIds(userToken);

    expect(result).toEqual(['deal1', 'deal2', 'deal3']);
  });

  it('should return an empty array when no amendments are provided', async () => {
    api.getAllAmendments.mockResolvedValue([]);

    const result = await getCheckersApprovalAmendmentDealIds(userToken);

    expect(result).toEqual([]);
  });

  it('should throw an error if api.getAllAmendments fails', async () => {
    const mockError = new Error('API error');
    api.getAllAmendments.mockRejectedValue(mockError);

    await expect(getCheckersApprovalAmendmentDealIds(userToken)).rejects.toThrow('API error');
  });
});
