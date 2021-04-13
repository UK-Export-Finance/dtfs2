import api from '../../api';
import stringHelpers from '../../helpers/string';
import caseHelpers from './helpers';
import CONSTANTS from '../../constants';
import mapPremiumSchedule from './mapping/mapPremiumSchedule';

const {
  hasValue,
  containsNumber,
} = stringHelpers;
const {
  getTask,
  mapAssignToSelectOptions,
  userIsInTeam,
} = caseHelpers;


const getCaseDeal = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/deal/deal.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'deal',
    dealId,
    user: req.session.user,
  });
};

const getCaseTasks = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const userId = req.session.user._id; // eslint-disable-line no-underscore-dangle

  // default filter
  const tasksFilters = {
    filterType: CONSTANTS.TASK_FILTER_TYPES.USER,
    userId,
  };

  const deal = await api.getDeal(dealId, tasksFilters);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/tasks/tasks.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    tasks: deal.tfm.tasks,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user: req.session.user,
    selectedTaskFilter: CONSTANTS.TASK_FILTER_TYPES.USER,
  });
};

const filterCaseTasks = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const { filterType } = req.body;

  // currently, data shape allows users to be in multiple teams.
  // however, user will only ever be in one team.
  // TODO: update user.teams into single string (double check with business)
  const userTeamId = req.session.user.teams[0];

  const userId = req.session.user._id; // eslint-disable-line no-underscore-dangle

  const tasksFilters = {
    filterType,
    teamId: userTeamId,
    userId,
  };

  const deal = await api.getDeal(dealId, tasksFilters);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/tasks/tasks.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    tasks: deal.tfm.tasks,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user: req.session.user,
    selectedTaskFilter: filterType,
  });
};

const getCaseTask = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const { groupId, taskId } = req.params;
  const { user } = req.session;

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const task = getTask(Number(groupId), taskId, deal.tfm.tasks);

  if (!task) {
    return res.redirect('/not-found');
  }

  if (!task.canEdit) {
    // TODO: ideally we will redirect to custom error page.
    return res.redirect(`/case/${dealId}/tasks`);
  }

  const allTeamMembers = await api.getTeamMembers(task.team.id);

  return res.render('case/tasks/task.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user,
    task,
    assignToSelectOptions: mapAssignToSelectOptions(task, user, allTeamMembers),
  });
};

const putCaseTask = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const { groupId, taskId } = req.params;

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
    status,
  } = req.body;

  const update = {
    id: taskId,
    groupId: Number(groupId),
    status,
    assignedTo: {
      userId: assignedToValue,
    },
    updatedBy: req.session.user._id, // eslint-disable-line no-underscore-dangle
  };

  await api.updateTask(dealId, update);

  return res.redirect(`/case/${dealId}/tasks`);
};

const getCaseFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  const { associatedDealId } = facility.facilitySnapshot;
  const deal = await api.getDeal(associatedDealId);
  const premiumschedule = mapPremiumSchedule(facility.tfm.premiumSchedule);
  const premiumTotals = facility.tfm.premiumSchedule
    ? facility.tfm.premiumSchedule.map((s) => s.income).reduce((a, b) => a + b, 0).toFixed(2)
    : 0;
  return res.render('case/facility/facility.njk', {
    deal: deal.dealSnapshot,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    facility: facility.facilitySnapshot,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'facility',
    facilityId,
    premiumschedule,
    schedule_count: premiumschedule.length,
    facilityTfm: facility.tfm,
    premiumTotals,
    user: req.session.user,
  });
};

const getCaseParties = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/parties.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    dealId,
    user: req.session.user,
  });
};

const getPartyDetails = (partyType) => (
  async (req, res) => {
    const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    return res.render(`case/parties/edit/${partyType}-edit.njk`, {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'parties',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId,
      user: req.session.user,
    });
  }
);

const getExporterPartyDetails = getPartyDetails('exporter');
const getBuyerPartyDetails = getPartyDetails('buyer');
const getAgentPartyDetails = getPartyDetails('agent');
const getIndemnifierPartyDetails = getPartyDetails('indemnifier');

const getBondIssuerPartyDetails = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-issuer-edit.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user: req.session.user,
  });
};


const getBondBeneficiaryPartyDetails = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-beneficiary-edit.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user: req.session.user,
  });
};

const getUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  return res.render('case/underwriting/pricing-and-risk/pricing-and-risk.njk', {
    userCanEdit: userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT),
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
  });
};

const getUnderWritingPricingAndRiskEdit = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const postUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const existingValue = deal.tfm.exporterCreditRating;
  let submittedValue;

  if (hasValue(req.body.exporterCreditRatingOther)
    && req.body.exporterCreditRatingOther !== existingValue) {
    submittedValue = req.body.exporterCreditRatingOther;
  } else {
    submittedValue = req.body.exporterCreditRating;
  }

  let validationErrors;

  const selectedOther = req.body.exporterCreditRating === 'Other';
  const otherValue = hasValue(req.body.exporterCreditRatingOther);
  const otherValueHasNumericValues = containsNumber(req.body.exporterCreditRatingOther);

  const noOptionSelected = !hasValue(req.body.exporterCreditRating);

  const hasValidationError = ((selectedOther && !otherValue)
    || (selectedOther && otherValueHasNumericValues)
    || noOptionSelected);

  if (hasValidationError) {
    if (noOptionSelected) {
      validationErrors = {
        count: 1,
        errorList: {
          exporterCreditRating: {
            text: 'Enter a credit rating',
            order: '1',
          },
        },
        summary: [{
          text: 'Enter a credit rating',
          href: '#exporterCreditRating',
        }],
      };
    }

    if (selectedOther) {
      if (!otherValue) {
        validationErrors = {
          count: 1,
          errorList: {
            exporterCreditRatingOther: {
              text: 'Enter a credit rating',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a credit rating',
            href: '#exporterCreditRatingOther',
          }],
        };
      }

      if (otherValueHasNumericValues) {
        validationErrors = {
          count: 1,
          errorList: {
            exporterCreditRatingOther: {
              text: 'Credit rating must not include numbers',
              order: '1',
            },
          },
          summary: [{
            text: 'Credit rating must not include numbers',
            href: '#exporterCreditRatingOther',
          }],
        };
      }
    }

    return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'pricing and risk',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        exporterCreditRating: submittedValue,
      },
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    exporterCreditRating: submittedValue,
  };

  await api.updateCreditRating(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

const postPartyDetails = (partyType) => (
  async (req, res) => {
    const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    const update = {
      [partyType]: req.body,
    };

    await api.updateParty(dealId, update);

    return res.redirect(`/case/${dealId}/parties`);
  }
);

const postExporterPartyDetails = postPartyDetails('exporter');
const postBuyerPartyDetails = postPartyDetails('buyer');
const postAgentPartyDetails = postPartyDetails('agent');
const postIndemnifierPartyDetails = postPartyDetails('indemnifier');

const postTfmFacility = async (req, res) => {
  const { facilityId, ...facilityUpdateFields } = req.body;
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  await Promise.all(
    facilityId.map((id, index) => {
      const facilityUpdate = {};
      Object.entries(facilityUpdateFields).forEach(([fieldName, values]) => {
        facilityUpdate[fieldName] = values[index];
      });
      return api.updateFacility(id, facilityUpdate);
    }),
  );


  // const { data } = await api.updateParty(dealId, update);

  return res.redirect(`/case/${dealId}/parties`);
};


export default {
  getCaseDeal,
  getCaseTasks,
  filterCaseTasks,
  getCaseTask,
  putCaseTask,
  getCaseFacility,
  getCaseParties,
  getExporterPartyDetails,
  getBuyerPartyDetails,
  getAgentPartyDetails,
  getIndemnifierPartyDetails,
  getBondIssuerPartyDetails,
  getBondBeneficiaryPartyDetails,
  getUnderWritingPricingAndRisk,
  getUnderWritingPricingAndRiskEdit,
  postUnderWritingPricingAndRisk,
  postExporterPartyDetails,
  postBuyerPartyDetails,
  postAgentPartyDetails,
  postIndemnifierPartyDetails,
  postTfmFacility,
};
