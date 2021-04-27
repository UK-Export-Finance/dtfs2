const isDecisionSubmitted = (dealTfm) => {
  const { managersDecision } = dealTfm;

  if (managersDecision
    && managersDecision.decision
    && managersDecision.timestamp) {
    return true;
  }

  return false;
};

export default {
  isDecisionSubmitted,
};
