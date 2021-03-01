import apollo from './graphql/apollo';
import dealQuery from './graphql/queries/deal-query';
import dealsQuery from './graphql/queries/deals-query';
import facilityQuery from './graphql/queries/facility-query';
import updatePartiesMutation from './graphql/mutations/update-parties';
import updateFacilityMutation from './graphql/mutations/update-facilities';

const getDeal = async (id) => {
  const response = await apollo('GET', dealQuery, { id });
  return response.data.deal;
};

const getDeals = async () => {
  const response = await apollo('GET', dealsQuery);
  return response.data.deals;
};


const getFacility = async (id) => {
  const response = await apollo('GET', facilityQuery, { id });

  return response.data.facility;
};

const updateParty = async (id, partyUpdate) => {
  const updateVariables = {
    id,
    partyUpdate,
  };

  const response = await apollo('PUT', updatePartiesMutation, updateVariables);
  return response;
};

const updateFacility = async (id, facilityUpdate) => {
  const updateVariables = {
    id,
    facilityUpdate,
  };
  const response = await apollo('PUT', updateFacilityMutation, updateVariables);
  return response;
};

export default {
  getDeal,
  getDeals,
  getFacility,
  updateParty,
  updateFacility,
};
