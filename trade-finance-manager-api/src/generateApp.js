const express = require('express');
const passport = require('passport');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoSanitise = require('express-mongo-sanitize');
const graphqlKeyAuthentication = require('./graphql/key-authentication');
const graphqlPermissions = require('./graphql/middleware/graphql-permissions');
const {
  resolvers, typeDefs, graphQlRouter,
} = require('./graphql');
const healthcheck = require('./healthcheck');
const { authRouter, openRouter } = require('./v1/routes');
const loginController = require('./v1/controllers/user/user.routes');
const initScheduler = require('./scheduler');
const seo = require('./v1/middleware/headers/seo');
const security = require('./v1/middleware/headers/security');
const removeCsrfToken = require('./v1/middleware/remove-csrf-token');
const configurePassport = require('./v1/controllers/user/passport');
const createRateLimit = require('./v1/middleware/rateLimit/index');

initScheduler();

configurePassport(passport);

const generateApp = () => {
  const app = express();

  app.use(createRateLimit());
  app.use(seo);
  app.use(security);
  app.use(express.json());
  app.use(compression());
  app.use(removeCsrfToken);
  app.use(healthcheck);
  app.use(passport.initialize());
  app.post('/v1/login', loginController.login);
  app.use('/v1', openRouter);
  app.use('/v1', authRouter);
  app.use(graphQlRouter);

  // MongoDB sanitisation
  app.use(mongoSanitise({
    allowDots: true,
  }));

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const schemaWithMiddleware = applyMiddleware(schema, graphqlPermissions);

  const startServer = async () => {
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      formatResponse: (response, context) => {
        const { graphqlPermissions: permissions } = context.context;

        const isAuthenticated = (permissions.read || permissions.write);

        const dataKeys = Object.keys(response.data);

        // if there is no data, object will be null.
        const hasData = response.data[dataKeys[0]];

        if (isAuthenticated && !hasData) {
          return {
            errors: [
              { message: 'Server error returning query.' },
            ],
          };
        }

        return response;
      },
      context: ({ req }) => ({
        graphqlPermissions: graphqlKeyAuthentication(req),
        user: req.user,
      }),
      schema: schemaWithMiddleware,
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
  };
  startServer();

  // Return 200 on get to / to confirm to Azure that
  // the container has started successfully:
  const rootRouter = express.Router();
  rootRouter.get('/', (req, res) => {
    res.status(200).send();
  });

  rootRouter.use('/v1/api-docs', swaggerUi.serve);

  app.use('/', rootRouter);

  return app;
};

module.exports = {
  generateApp,
};
