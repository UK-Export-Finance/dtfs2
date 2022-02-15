import activityController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import CONSTANTS from '../../../constants';
import generateValidationErrors from '../../../helpers/validation';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
};

describe('GET activity', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '61f6ac5b02ffda01b1e8efef',
      dealSnapshot: {
        _id: '61f6ac5b02ffda01b1e8efef',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        activities: [],
      },
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      const activities = activityController.mappedActivities(mockDeal.tfm.activities);

      await activityController.getActivity(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/activity/activity.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
          activities,
        },
      );
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await activityController.getActivity(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST activity (filter)', () => {
  const MOCK_AUTHOR = {
    firstName: 'tester',
    lastName: 'smith',
    _id: 12243343242342,
  };

  const mockDeal = {
    _id: '61f6ac5b02ffda01b1e8efef',
    dealSnapshot: {
      _id: '61f6ac5b02ffda01b1e8efef',
      submissionDetails: {
        supplierName: 'test supplier',
      },
    },
    tfm: {
      activities: [
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
      ],
    },
  };

  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render filtered activities with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        body: {
          filterType: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
        },
        session,
      };

      const activities = activityController.mappedActivities(mockDeal.tfm.activities);

      await activityController.filterActivities(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/activity/activity.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
          activities,
        },
      );
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
        body: {
          filterType: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
        },
      };

      await activityController.filterActivities(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('GET activity - post-comment', () => {
  const mockDeal = {
    _id: '61f6ac5b02ffda01b1e8efef',
    dealSnapshot: {
      _id: '61f6ac5b02ffda01b1e8efef',
      submissionDetails: {
        supplierName: 'test supplier',
      },
    },
    tfm: {
      activities: [],
    },
  };

  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render the comment box', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await activityController.getCommentBox(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/activity/activity-comment.njk',
        {
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          maxCommentLength: 1000,
        },
      );
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await activityController.getCommentBox(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST activity - post-comment', () => {
  const mockDeal = {
    _id: '61f6ac5b02ffda01b1e8efef',
    dealSnapshot: {
      _id: '61f6ac5b02ffda01b1e8efef',
      submissionDetails: {
        supplierName: 'test supplier',
      },
    },
    tfm: {
      activities: [],
    },
  };

  const longComment = 'aaaaa'.repeat(201);
  const normalComment = 'test';

  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should return to comment box with errors if longer than 1000 characters', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        body: {
          comment: longComment,
        },
        session,
      };

      await activityController.postComment(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/activity/activity-comment.njk',
        {
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          maxCommentLength: 1000,
          validationErrors: generateValidationErrors(
            'comment',
            'Comments must be 1000 characters or fewer',
            0,
            {},
          ),
          comment: longComment,
        },
      );
    });

    it('should return render activities page with all-activity filter after posting comment', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        body: {
          comment: normalComment,
        },
        session,
      };
      const activities = activityController.mappedActivities(mockDeal.tfm.activities);

      await activityController.postComment(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/activity/activity.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
          activities,
        },
      );
    });
    it('should return render activities page with all-activity filter after not posting a comment', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        body: {
          comment: '',
        },
        session,
      };
      const activities = activityController.mappedActivities(mockDeal.tfm.activities);

      await activityController.postComment(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/activity/activity.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
          activities,
        },
      );
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
        body: {
          comment: 'test',
        },
      };

      await activityController.postComment(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
