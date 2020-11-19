const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
const graphQlRouter = require('./routes');

module.exports = {
  typeDefs,
  resolvers,
  graphQlRouter,
};
