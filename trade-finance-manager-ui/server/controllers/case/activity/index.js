const moment = require('moment');
const api = require('../../../api');

const getActivity = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const mappedActivities = deal.tfm.activities.map((activity) => ({
    label: {
      text: 'TODO',
    },
    text: activity.text,
    datetime: {
      timestamp: moment.unix(activity.timestamp).format('D MMM YYYY'),
      type: 'date',
    },
    byline: {
      // eslint-disable-next-line no-multi-spaces
      text: `${activity.author.firstName  } ${  activity.author.lastName}`,
    },
  }));
  // remove later
  //const mappper = deal.tfm.activities.filter(activity => activity.type === 'COMMENT');

  // console.log(mappper);

  const mappedComment = [];
  const comments = deal.tfm.activities.filter((activity) => {
    if (activity.type === 'COMMENT') {
      const comment = {
        label: {
          text: 'Comment added',
        },
        text: activity.text,
        datetime: {
          timestamp: moment.unix(activity.timestamp).format('D MMM YYYY'),
          type: 'date',
        },
        byline: {
          // eslint-disable-next-line no-multi-spaces
          text: `${activity.author.firstName} ${activity.author.lastName}`,
        },
      };
      // console.log('comment', comment);
      mappedComment.push(comment);
      // console.log('comments', comments);
    }
    return mappedComment;
  });
  

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    activities: mappedActivities,
    comments: mappedComment,
  });
};

const getCommentBox = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }
  console.log(deal);
  const { user } = req.session;

  return res.render('case/activity/activity-comment.njk', {
    // dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    dealId,
    user,
  });
};

const postComment = async (req, res) => {
  const { params, session, body } = req;
  const dealId = params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);
  const { user } = session;
  const { comment } = body;

  try {
    if (comment) {
      const shortUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      };
      const commentObj = {
        type: 'COMMENT',
        timestamp: moment().unix(),
        author: shortUser,
        text: comment,
      };
      // const comments = deal.tfm.activities;
      // comments.push(commentObj);
      await api.updateActivity(dealId, commentObj);
    }
  } catch (err) {
    console.log(err);
  }
  const updatedDeal = await api.getDeal(dealId);
  const mappedActivities = updatedDeal.tfm.activities.map((activity) => ({
    label: {
      text: 'TODO',
    },
    text: activity.text,
    datetime: {
      timestamp: moment.unix(activity.timestamp).format('D MMM YYYY'),
      type: 'date',
    },
    byline: {
      // eslint-disable-next-line no-multi-spaces
      text: `${activity.author.firstName  } ${  activity.author.lastName}`,
    },
  }));

  const mappedComment = [];
  const comments = updatedDeal.tfm.activities.filter((activity) => {
    if (activity.type === 'COMMENT') {
      const comment = {
        label: {
          text: 'Comment added',
        },
        text: activity.text,
        datetime: {
          timestamp: moment.unix(activity.timestamp).format('D MMM YYYY'),
          type: 'date',
        },
        byline: {
          // eslint-disable-next-line no-multi-spaces
          text: `${activity.author.firstName} ${activity.author.lastName}`,
        },
      };
      // console.log('comment', comment);
      mappedComment.push(comment);
      // console.log('comments', comments);
    }
    return mappedComment;
  });

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    activities: mappedActivities,
    comments: mappedComment,
    user,
  });
};

module.exports = {
  getActivity,
  getCommentBox,
  postComment,
};
