import apollo from './graphql/apollo';
import dealQuery from './graphql/queries/deal-query';
import dealsQuery from './graphql/queries/deals-query';
import facilityQuery from './graphql/queries/facility-query';

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

export default {
  getDeal,
  getDeals,
  getFacility,
};
