import api from './api';

const template = {
  details: {},
};
const workflow = (existingDeal) => {
  const initialDeal = existingDeal || { ...template };

  let updatedDeal = { ...initialDeal };

  const workflowObject = {
    updatedDeal: () => updatedDeal,
    setCriteriaMet: async (criteria, token) => {
      updatedDeal.criteriaMet = criteria;
      updatedDeal = await api.upsertDeal(updatedDeal, token);
    },
    setBankDetails: async (bankDealId, bankDealName, token) => {
      updatedDeal.details.bankDealId = bankDealId;
      updatedDeal.details.bankDealName = bankDealName;
      updatedDeal = await api.upsertDeal(updatedDeal, token);
    },
  };

  return workflowObject;
};

export default workflow;
