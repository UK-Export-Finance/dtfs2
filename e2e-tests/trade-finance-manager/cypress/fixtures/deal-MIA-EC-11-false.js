import DEAL_MIA from './deal-MIA';

const DEAL_MIA_EC_11_FALSE =  {
  ...DEAL_MIA,
  eligibility: {
    ...DEAL_MIA.eligibility,
    criteria: [
      ...DEAL_MIA.eligibility.criteria,
      {
        id: 11,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: false,
      },
    ],
  },
};

export default DEAL_MIA_EC_11_FALSE;
