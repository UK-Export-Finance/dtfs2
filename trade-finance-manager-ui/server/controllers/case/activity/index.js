const api = require('../../../api');
const moment = require('moment');

const getActivity = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
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
  console.log(deal);
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
      const comments = deal.tfm.activities;
      comments.push(commentObj);
      await api.updateActivityComment(dealId, comments);
      console.log(comments);
    }
  } catch (err) {
    console.log(err);
  }


  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
  });
};

module.exports = {
  getActivity,
  getCommentBox,
  postComment,
};
