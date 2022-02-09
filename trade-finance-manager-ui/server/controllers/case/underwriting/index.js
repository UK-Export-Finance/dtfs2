const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const underwriterManagersDecision = require('./underwriter-managers-decision');

module.exports = {
  ...leadUnderwriter,
  ...pricingAndRisk,
  ...underwriterManagersDecision,
};
