const dotenv = require('dotenv');
const express = require('express');
const compression = require('compression');
const { CaptureConsole } = require('@sentry/integrations');
const Sentry = require('@sentry/node');
const swaggerUi = require('swagger-ui-express');
// const helmet = require('helmet');

const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const graphqlKeyAuthentication = require('./graphql/key-authentication');
const graphqlPermissions = require('./graphql/middleware/graphql-permissions');

const {
  resolvers, typeDefs, graphQlRouter,
} = require('./graphql');

const healthcheck = require('./healthcheck');
const openRouter = require('./v1/routes');
const initScheduler = require('./scheduler');

dotenv.config();

initScheduler();

const app = express();
// app.use(helmet());
app.use(express.json());
app.use(compression());

app.use(healthcheck);
app.use('/v1', openRouter);
app.use(graphQlRouter);

const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema, graphqlPermissions);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    graphqlPermissions: graphqlKeyAuthentication(req),
    user: req.user,
  }),
  schema: schemaWithMiddleware,
});

server.applyMiddleware({ app });

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

rootRouter.use(Sentry.Handlers.requestHandler());

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new CaptureConsole(
    {
      // array of methods that should be captured
      // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
      levels: ['error'],
    },
  )],
  tracesSampleRate: 1.0,
});

rootRouter.use(Sentry.Handlers.errorHandler());

rootRouter.use('/v1/api-docs', swaggerUi.serve);

app.use('/', rootRouter);

module.exports = app;
