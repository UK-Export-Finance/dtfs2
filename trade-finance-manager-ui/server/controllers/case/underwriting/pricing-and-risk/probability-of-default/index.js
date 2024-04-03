const { TEAM_IDS } = require('@ukef/dtfs2-common');
const api = require('../../../../../api');
const { userIsInTeam } = require('../../../../../helpers/user');
const { probabilityOfDefaultValidation } = require('../../../../helpers');

const getUnderWritingProbabilityOfDefault = async (req, res) => {
  const dealId = req.params._id;
  const { userToken, user } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITERS, TEAM_IDS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/probability-of-default.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
  });
};

const postUnderWritingProbabilityOfDefault = async (req, res) => {
  const dealId = req.params._id;
  const { user, userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITERS, TEAM_IDS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  let validationErrors;
  let errorMsg;

  const { probabilityOfDefault } = req.body;

  if (!probabilityOfDefault) {
    errorMsg = 'Enter a probability of default';
    // checks that value is between 0.01 and 14.09 and only up to 2dp
  } else if (!probabilityOfDefaultValidation(probabilityOfDefault)) {
    errorMsg = 'You must enter a percentage between 0.01% to 14.09%';
  }

  if (errorMsg) {
    validationErrors = {
      count: 1,
      errorList: {
        probabilityOfDefault: {
          text: errorMsg,
          order: '1',
        },
      },
      summary: [
        {
          text: errorMsg,
          href: '#probabilityOfDefault',
        },
      ],
    };

    return res.render('case/underwriting/pricing-and-risk/probability-of-default.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        probabilityOfDefault,
      },
      dealId: deal.dealSnapshot._id,
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    probabilityOfDefault: Number(probabilityOfDefault),
  };

  await api.updateProbabilityOfDefault(dealId, update, userToken);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getUnderWritingProbabilityOfDefault,
  postUnderWritingProbabilityOfDefault,
};
