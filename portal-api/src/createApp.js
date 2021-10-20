const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const compression = require('compression');

const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const Sentry = require('@sentry/node');
const { CaptureConsole } = require('@sentry/integrations');
// const Tracing = require('@sentry/tracing');
const healthcheck = require('./healthcheck');
const uploadTest = require('./upload-test');

const { resolvers, typeDefs, graphQlRouter } = require('./graphql');
const { validateUserMiddleware } = require('./graphql/middleware');
const initScheduler = require('./scheduler');

dotenv.config();

const { CORS_ORIGIN, SENTRY_DSN } = process.env;

const configurePassport = require('./v1/users/passport');
const { authRouter, openRouter, authRouterAllowXss } = require('./v1/routes');

configurePassport(passport);
initScheduler();

const app = express();
app.use(healthcheck);
app.use(uploadTest);
app.use(passport.initialize());
app.use(express.json());
app.use(compression());

app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/v1', openRouter);
app.use('/v1', authRouterAllowXss);
app.use('/v1', authRouter);

app.use(graphQlRouter);

Sentry.init({
  // environment: 'development',
  dsn: SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    // new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    // new Tracing.Integrations.Express({ app }),
    new CaptureConsole(
      {
        // array of methods that should be captured
        // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
        levels: ['error'],
      },
    ),
  ],

  // Adjust this value in production, or using tracesSampler for finer control
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
// app.use(Sentry.Handlers.requestHandler());
// // TracingHandler creates a trace for every incoming request
// app.use(Sentry.Handlers.tracingHandler());

const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema, validateUserMiddleware);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user,
  }),
  schema: schemaWithMiddleware,
});

server.applyMiddleware({ app });

// The error handler must be before any other error middleware and after all controllers
// app.use(
//   Sentry.Handlers.errorHandler({
//     shouldHandleError(error) {
//       // Capture all 4xx and 5xx errors
//       const errorList = [400, 401, 403, 404, 500, 501, 502, 503, 504, 507];
//       if (errorList.includes(error.status)) {
//         return true;
//       }
//       return false;
//     },
//   }),
// );

app.use((err) => {
  console.log(err);
});

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});
app.use('/', rootRouter);

module.exports = app;
