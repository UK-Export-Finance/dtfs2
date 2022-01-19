const { userRoleIsValid } = require('../../role-validator');

const validateUserMiddleware = {
  Query: {
    allDeals: async (resolve, parent, args, ctx, info) => {
      // You can use middleware to override arguments
      const userIsValid = userRoleIsValid(['maker', 'checker'], ctx.user);

      if (userIsValid) {
        const res = await resolve(parent, args, ctx, info);

        return {
          status: {
            code: 200,
          },
          ...res,
        };
      }

      return {
        status: {
          code: 401,
          msg: "you don't have the right role",
        },
      };
    },
  },
};

module.exports = validateUserMiddleware;
