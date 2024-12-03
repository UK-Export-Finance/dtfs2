const { TEAM_IDS } = require('@ukef/dtfs2-common');
const api = require('../../../../../api');
const { userIsInTeam } = require('../../../../../helpers/user');

const getUnderWritingLossGivenDefault = async (req, res) => {
  const dealId = req.params._id;
  const { userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITERS, TEAM_IDS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/loss-given-default.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
  });
};

const postUnderWritingLossGivenDefault = async (req, res) => {
  const dealId = req.params._id;
  const { user, userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITERS, TEAM_IDS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  let validationErrors;
  let errorMsg;

  const { lossGivenDefault } = req.body;

  // eslint-disable-next-line eqeqeq
  if (Number(lossGivenDefault) != lossGivenDefault || Number(lossGivenDefault) < 1 || Number(lossGivenDefault) > 100) {
    errorMsg = 'Enter a value between 1 - 100';
  }

  if (!lossGivenDefault) {
    errorMsg = 'Enter a loss given default';
  }

  if (errorMsg) {
    validationErrors = {
      count: 1,
      errorList: {
        lossGivenDefault: {
          text: errorMsg,
          order: '1',
        },
      },
      summary: [
        {
          text: errorMsg,
          href: '#lossGivenDefault',
        },
      ],
    };

    return res.render('case/underwriting/pricing-and-risk/loss-given-default.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        lossGivenDefault,
      },
      dealId: deal.dealSnapshot._id,
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    lossGivenDefault: Number(lossGivenDefault),
  };

  await api.updateLossGivenDefault(dealId, update, userToken);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getUnderWritingLossGivenDefault,
  postUnderWritingLossGivenDefault,
};
