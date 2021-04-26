import pricingAndRisk from './pricing-and-risk';
import bankSecurity from './bank-security';
import underwriterManagersDecision from './underwriter-managers-decision';

export default {
  ...pricingAndRisk,
  ...bankSecurity,
  ...underwriterManagersDecision,
};
