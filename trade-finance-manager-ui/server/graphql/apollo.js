const { ApolloClient } = require('apollo-client');
const fetch = require('node-fetch');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');

require('dotenv').config();

const urlRoot = process.env.TRADE_FINANCE_MANAGER_API_URL;
const apiToken = process.env.UKEF_TFM_API_SYSTEM_KEY;

const httpLink = createHttpLink({
  uri: `${urlRoot}/graphql`,
  fetch,
});

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions,
});

const doQuery = async (query, variables) => {
  try {
    return await client.query({
      query,
      variables,
      context: {
        headers: {
          Authorization: apiToken,
        },
      },
    });
  } catch (err) {
    return err;
  }
};

const doMutate = async (mutation, variables) => {
  try {
    return await client.mutate({
      mutation,
      variables,
      context: {
        headers: {
          Authorization: apiToken,
        },
      },
    });
  } catch (err) {
    return err;
  }
};

const apollo = async (method, query, variables) => {
  switch (method) {
    case 'POST':
    case 'PUT':
      return doMutate(query, variables);

    case 'GET':
    default:
      return doQuery(query, variables);
  }
};

module.exports = apollo;
