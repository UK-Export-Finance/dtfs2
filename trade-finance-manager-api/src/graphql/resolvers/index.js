const queryDeals = require('./query-deals');
const queryDeal = require('./query-deal');
const queryFacility = require('./query-facility');
const queryTeamMembers = require('./query-team-members');

const updateParties = require('./mutation-update-parties');
const updateFacility = require('./mutation-update-facility');
const updateTask = require('./mutation-update-task');
const updateCreditRating = require('./mutation-update-credit-rating');
const updateLossGivenDefault = require('./mutation-update-loss-given-default');
const updateUnderwriterManagersDecision = require('./mutation-update-underwriter-managers-decision');


const resolvers = {
  Query: {
    deal: (root, args) => queryDeal(args),
    deals: (root, args) => queryDeals(args.params),
    facility: (root, args) => queryFacility(args),
    teamMembers: (root, args) => queryTeamMembers(args),
  },
  Mutation: {
    updateParties: (root, args) => updateParties(args),
    updateFacility: (root, args) => updateFacility(args),
    updateTask: (root, args) => updateTask(args),
    updateCreditRating: (root, args) => updateCreditRating(args),
    updateLossGivenDefault: (root, args) => updateLossGivenDefault(args),
    updateUnderwriterManagersDecision: (root, args) => updateUnderwriterManagersDecision(args),
  },
};

module.exports = resolvers;
