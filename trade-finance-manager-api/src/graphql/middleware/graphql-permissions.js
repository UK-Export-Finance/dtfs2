const { shield, rule } = require('graphql-shield');

const hasReadAccess = rule({ cache: 'contextual' })((parent, args, ctx) => ctx.graphqlPermissions.read);

const hasWriteAccess = rule({ cache: 'contextual' })((parent, args, ctx) => ctx.graphqlPermissions.write);

const graphqlPermissions = shield({
  Query: {
    '*': hasReadAccess,
  },
  Mutation: {
    '*': hasWriteAccess,
  },
});

module.exports = graphqlPermissions;
