import apollo from './graphql/apollo';

import dealQuery from './graphql/queries';

const getDeal = async (id) => {
  const response = await apollo('GET', dealQuery, { id });

  return response.data.deal;
};

export default {
  getDeal,
};
