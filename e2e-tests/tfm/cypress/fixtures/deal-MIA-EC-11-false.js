import DEAL_MIA from './deal-MIA';

const criteriaWithAnswer11False = () => {
  const originalCriteria = DEAL_MIA.eligibility.criteria;

  const mapped = originalCriteria.map((criterion) => {
    if (criterion.id === 11) {
      return {
        ...criterion,
        answer: false,
      };
    }

    return criterion;
  });

  return mapped;
};

const DEAL_MIA_EC_11_FALSE = {
  ...DEAL_MIA,
  eligibility: {
    ...DEAL_MIA.eligibility,
    criteria: criteriaWithAnswer11False(),
  },
};

export default DEAL_MIA_EC_11_FALSE;
