import dealFormsCompleted, { allBondsCompleted } from './dealFormsCompleted';

describe('allBondsCompleted', () => {
  it('should return false when any bond has a status that is NOT `Completed`', () => {
    const mockBonds = [
      { _id: '12345678911', status: 'Completed' },
      { _id: '12345678910', status: 'Incomplete' },
    ];

    const result = allBondsCompleted(mockBonds);
    expect(result).toEqual(false);
  });

  it('should return true when all bonds have a status of `Completed`', () => {
    const mockBonds = [
      { _id: '12345678911', status: 'Completed' },
    ];

    const result = allBondsCompleted(mockBonds);
    expect(result).toEqual(true);
  });
});

describe('dealFormsCompleted', () => {
  it('should return false when a deal\'s eligibility.status is NOT `Completed`', () => {
    const mockDeal = {
      _id: '12345678910',
      eligibility: {
        status: 'Incomplete',
      },
    };

    const result = dealFormsCompleted(mockDeal);
    expect(result).toEqual(false);
  });

  it('should return true when a deal has `Completed` eligibility.status and all bondTransactions have `Completed` status', () => {
    const mockDeal = {
      eligibility: {
        status: 'Completed',
      },
      bondTransactions: {
        items: [
          { _id: '12345678911', status: 'Completed' },
          { _id: '12345678910', status: 'Completed' },
        ],
      },
    };

    const result = dealFormsCompleted(mockDeal);
    expect(result).toEqual(true);
  });
});
