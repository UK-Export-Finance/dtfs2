import { ApolloClient } from 'apollo-client';
import fetch from 'node-fetch';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

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

export const apollo = async (method, query, variables, token) => {
  switch (method) {
    case 'POST':
    case 'PUT':
      return doMutate(query, variables, token);

    case 'GET':
    default:
      return doQuery(query, variables, token);
  }
};

export default apollo;
