const { ApolloClient } = require('apollo-client');
const fetch = require('node-fetch');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');

require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

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

const doQuery = async (query, variables, token) => {
  try {
    return await client.query({
      query,
      variables,
      context: {
        headers: {
          Authorization: token,
        },
      },
    });
  } catch (err) {
    return err;
  }
};

const doMutate = async (mutation, variables, token) => {
  try {
    return await client.mutate({
      mutation,
      variables,
      context: {
        headers: {
          Authorization: token,
        },
      },
    });
  } catch (err) {
    return err;
  }
};

const apollo = async (method, query, variables, token) => {
  switch (method) {
    case 'POST':
    case 'PUT':
      return doMutate(query, variables, token);

    case 'GET':
    default:
      return doQuery(query, variables, token);
  }
};

module.exports = apollo;
