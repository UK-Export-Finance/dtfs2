import apollo from './graphql/apollo';
import dealQuery from './graphql/queries/deal-query';
import facilityQuery from './graphql/queries/facility-query';

const getDeal = async (id) => {
  const response = await apollo('GET', dealQuery, { id });

  return response.data.deal;
};

const getFacility = async (id) => {
  const response = await apollo('GET', facilityQuery, { id });

  return response.data.facility;
};

export default {
  getDeal,
  getFacility,
};
