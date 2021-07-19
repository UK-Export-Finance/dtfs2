const queryDeals = require('./query-deals');
const queryDeal = require('./query-deal');
const queryFacility = require('./query-facility');
const queryTeamMembers = require('./query-team-members');
const queryUser = require('./query-user');

const updateParties = require('./mutation-update-parties');
const updateFacility = require('./mutation-update-facility');
const updateFacilityRiskProfile = require('./mutation-update-facility-risk-profile');
const updateTask = require('./mutation-update-task');
const updateCreditRating = require('./mutation-update-credit-rating');
const updateLossGivenDefault = require('./mutation-update-loss-given-default');
const updateProbabilityOfDefault = require('./mutation-update-probability-of-default');
const updateUnderwriterManagersDecision = require('./mutation-update-underwriter-managers-decision');
const updateLeadUnderwriter = require('./mutation-update-lead-underwriter');


const resolvers = {
  Query: {
    deal: (root, args) => queryDeal(args),
    deals: (root, args) => queryDeals(args.params),
    facility: (root, args) => queryFacility(args),
    teamMembers: (root, args) => queryTeamMembers(args),
    user: (root, args) => queryUser(args),
  },
  Mutation: {
    updateParties: (root, args) => updateParties(args),
    updateFacility: (root, args) => updateFacility(args),
    updateFacilityRiskProfile: (root, args) => updateFacilityRiskProfile(args),
    updateTask: (root, args) => updateTask(args),
    updateCreditRating: (root, args) => updateCreditRating(args),
    updateLossGivenDefault: (root, args) => updateLossGivenDefault(args),
    updateProbabilityOfDefault: (root, args) => updateProbabilityOfDefault(args),
    updateUnderwriterManagersDecision: (root, args) => updateUnderwriterManagersDecision(args),
    updateLeadUnderwriter: (root, args) => updateLeadUnderwriter(args),
  },
};

module.exports = resolvers;
