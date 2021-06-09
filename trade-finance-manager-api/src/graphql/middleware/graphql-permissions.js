const { shield, rule } = require('graphql-shield');

const hasReadAccess = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => ctx.graphqlPermissions.read,
);

const hasWriteAccess = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => ctx.graphqlPermissions.write,
);

const graphqlPermissions = shield({
  Query: {
    '*': hasReadAccess,
  },
  Mutation: {
    '*': hasWriteAccess,
  },
});

module.exports = graphqlPermissions;
