/* eslint-disable no-underscore-dangle */
import activityController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import CONSTANTS from '../../../constants';

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
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
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
      expect(res.render).toHaveBeenCalledWith('case/activity/activity.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
          activities,
        });
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

describe('filterActivities()', () => {
  const MOCK_AUTHOR = {
    firstName: 'tester',
    lastName: 'smith',
    _id: 12243343242342,
  };

  const mockDeal = {
    _id: '1000023',
    dealSnapshot: {
      _id: '1000023',
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
    expect(res.render).toHaveBeenCalledWith('case/activity/activity.njk',
      {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'activity',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
        activities,
      });
  });
});

describe('getCommentBox()', () => {
  const mockDeal = {
    _id: '1000023',
    dealSnapshot: {
      _id: '1000023',
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

  it('should render the comment box', async () => {
    const req = {
      params: {
        _id: mockDeal._id,
      },
      session,
    };

    await activityController.getCommentBox(req, res);
    expect(res.render).toHaveBeenCalledWith('case/activity/activity-comment.njk',
      {
        dealId: mockDeal.dealSnapshot._id,
        user: session.user,
        maxCommentLength: 1000,
      });
  });
});

describe('postComment()', () => {
  const mockDeal = {
    _id: '1000023',
    dealSnapshot: {
      _id: '1000023',
      submissionDetails: {
        supplierName: 'test supplier',
      },
    },
    tfm: {
      activities: [],
    },
  };

  const longComment = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Na';
  const normalComment = 'test';

  beforeEach(() => {
    api.getDeal = () => Promise.resolve(mockDeal);
  });

  it('should return to comment box if longer than 1000 characters', async () => {
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
    expect(res.render).toHaveBeenCalledWith('case/activity/activity-comment.njk',
      {
        dealId: mockDeal.dealSnapshot._id,
        user: session.user,
        maxCommentLength: 1000,
      });
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
    expect(res.render).toHaveBeenCalledWith('case/activity/activity.njk',
      {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'activity',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
        activities,
      });
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
    expect(res.render).toHaveBeenCalledWith('case/activity/activity.njk',
      {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'activity',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
        activities,
      });
  });
});
