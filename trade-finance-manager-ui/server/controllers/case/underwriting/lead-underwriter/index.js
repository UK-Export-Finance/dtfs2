import api from '../../../../api';
import CONSTANTS from '../../../../constants';
import mapAssignToSelectOptions from '../../../../helpers/map-assign-to-select-options';

const getLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const allTeamMembers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);

  return res.render('case/underwriting/lead-underwriter/lead-underwriter.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'lead underwriter',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    assignToSelectOptions: mapAssignToSelectOptions('', user, allTeamMembers),
  });
};

const getAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const allTeamMembers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);

  return res.render('case/underwriting/lead-underwriter/assign-lead-underwriter.njk', {
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'lead underwriter',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    assignToSelectOptions: mapAssignToSelectOptions('', user, allTeamMembers),
  });
};

const postAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  // const { user } = req.session;
  // const allTeamMembers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);

  // return res.render('case/underwriting/lead-underwriter/assign-lead-underwriter.njk', {
  //   activeSubNavigation: 'underwriting',
  //   activeSideNavigation: 'lead underwriter',
  //   deal: deal.dealSnapshot,
  //   tfm: deal.tfm,
  //   dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
  //   user,
  //   assignToSelectOptions: mapAssignToSelectOptions('', user, allTeamMembers),
  // });

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
  } = req.body;

  const update = {
    userId: assignedToValue,
  };

  await api.updateLeadUnderwriter(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/lead-underwriter`);
};


export default {
  getLeadUnderwriter,
  getAssignLeadUnderwriter,
  postAssignLeadUnderwriter,
};
