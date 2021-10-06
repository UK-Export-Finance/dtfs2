const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const bankSecurity = require('./bank-security');
const underwriterManagersDecision = require('./underwriter-managers-decision');

module.exports = {
  ...leadUnderwriter,
  ...pricingAndRisk,
  ...bankSecurity,
  ...underwriterManagersDecision,
};
