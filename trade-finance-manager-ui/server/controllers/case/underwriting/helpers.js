const isDecisionSubmitted = (dealTfm) => {
  const { underwriterManagersDecision } = dealTfm;

  if (underwriterManagersDecision
    && underwriterManagersDecision.decision
    && underwriterManagersDecision.timestamp) {
    return true;
  }

  return false;
};

export default {
  isDecisionSubmitted,
};
