import api from '../../../../../api';
import {
  userIsInTeam,
} from '../../../../../helpers/user';
import CONSTANTS from '../../../../../constants';

const getUnderWritingProbabilityOfDefault = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/probability-of-default.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const postUnderWritingProbabilityOfDefault = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  let validationErrors;
  let errorMsg;

  const { probabilityOfDefault } = req.body;

  if (!probabilityOfDefault) {
    errorMsg = 'Enter a probability of default';
  }

  // eslint-disable-next-line eqeqeq
  if (Number(probabilityOfDefault) != probabilityOfDefault) {
    errorMsg = 'Enter a numeric value';
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
      summary: [{
        text: errorMsg,
        href: '#probabilityOfDefault',
      }],
    };


    return res.render('case/underwriting/pricing-and-risk/probability-of-default.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'pricing and risk',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        probabilityOfDefault,
      },
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    probabilityOfDefault,
  };

  await api.updateProbabilityOfDefault(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

export default {
  getUnderWritingProbabilityOfDefault,
  postUnderWritingProbabilityOfDefault,
};
