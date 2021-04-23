import pricingAndRisk from './pricing-and-risk';
import bankSecurity from './bank-security';
import underWritingManagersDecision from './underwriter-managers-decision';

export default {
  ...pricingAndRisk,
  ...bankSecurity,
  ...underWritingManagersDecision,
};
