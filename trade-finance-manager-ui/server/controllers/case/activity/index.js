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
  const { user, userToken } = session;
  const { comment } = body;

  return res.render('case/activity/activity-comment.njk', {
    // dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    dealId,
    user,
    comment,
  });

  // if (comment) {
  //   const commentObj = {
  //     type: 'COMMENT',
  //     timestamp: moment.now,
  //     author: user,
  //     text: comment  
  //   }
  // }


  
    



}

module.exports = {
  getActivity,
  getCommentBox,
  postComment,
};