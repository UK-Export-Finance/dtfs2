const { filter, filterByComment, filterActivities } = require('./filterActivities');

const MOCK_AUTHOR = {
  firstName: 'tester',
  lastName: 'smith',
  _id: 12243343242342,
};

const mockActivities = [
  {
    type: 'COMMENT',
    timestamp: 13345665,
    text: 'test1',
    author: MOCK_AUTHOR,
    label: 'Comment added',
  },
  {
    type: 'OTHER',
    timestamp: 13345665,
    text: '',
    author: MOCK_AUTHOR,
    label: 'Other',
  },
  {
    type: 'COMMENT',
    timestamp: 13345665,
    text: 'test2',
    author: MOCK_AUTHOR,
    label: 'Comment added',
  },
  {
    type: 'OTHER',
    timestamp: 13345665,
    text: 'test1',
    author: MOCK_AUTHOR,
    label: 'Other',
  },
];

const filtersObj = {
  filterType: 'comments-only',
};

describe('filterActivities', () => {
  describe('filter', () => {
    it('should filter activity types by the given FILTER_VALUE', () => {
      const mockFilterValue = 'OTHER';
      const result = filter(mockActivities, mockFilterValue);

      const expected = mockActivities.filter((activity) => activity.type === mockFilterValue);
      expect(result).toEqual(expected);
    });
  });

  describe('filterByComment', () => {
    it('should filter activity types by `COMMENT`', () => {
      const result = filterByComment(mockActivities);

      const expected = mockActivities.filter((activity) => activity.type === 'COMMENT');
      expect(result).toEqual(expected);
    });
  });

  describe('filterActivities', () => {
    it('should filter by comment when comment filter used', () => {
      const expected = [
        {
          type: 'COMMENT',
          timestamp: 13345665,
          text: 'test1',
          author: MOCK_AUTHOR,
          label: 'Comment added',
        },
        {
          type: 'COMMENT',
          timestamp: 13345665,
          text: 'test2',
          author: MOCK_AUTHOR,
          label: 'Comment added',
        },
      ];

      const filtered = filterActivities(mockActivities, filtersObj);
      expect(filtered).toEqual(expected);
    });

    it('if filtersObj set on all, should show all activities', () => {
      const expected = [
        {
          type: 'COMMENT',
          timestamp: 13345665,
          text: 'test1',
          author: MOCK_AUTHOR,
          label: 'Comment added',
        },
        {
          type: 'OTHER',
          timestamp: 13345665,
          text: '',
          author: MOCK_AUTHOR,
          label: 'Other',
        },
        {
          type: 'COMMENT',
          timestamp: 13345665,
          text: 'test2',
          author: MOCK_AUTHOR,
          label: 'Comment added',
        },
        {
          type: 'OTHER',
          timestamp: 13345665,
          text: 'test1',
          author: MOCK_AUTHOR,
          label: 'Other',
        },
      ];

      const filtersObjAll = {
        filterType: 'all-activity',
      };

      const filtered = filterActivities(mockActivities, filtersObjAll);
      expect(filtered).toEqual(expected);
    });

    it('if filtersObj set on null, should show all activities', () => {
      const expected = [
        {
          type: 'COMMENT',
          timestamp: 13345665,
          text: 'test1',
          author: MOCK_AUTHOR,
          label: 'Comment added',
        },
        {
          type: 'OTHER',
          timestamp: 13345665,
          text: '',
          author: MOCK_AUTHOR,
          label: 'Other',
        },
        {
          type: 'COMMENT',
          timestamp: 13345665,
          text: 'test2',
          author: MOCK_AUTHOR,
          label: 'Comment added',
        },
        {
          type: 'OTHER',
          timestamp: 13345665,
          text: 'test1',
          author: MOCK_AUTHOR,
          label: 'Other',
        },
      ];

      const filtersObjNull = {};

      const filtered = filterActivities(mockActivities, filtersObjNull);
      expect(filtered).toEqual(expected);
    });
  });
});
