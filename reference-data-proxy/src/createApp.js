// const bodyParser = require('body-parser');
// const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const { CaptureConsole } = require('@sentry/integrations');
const Sentry = require('@sentry/node');

const healthcheck = require('./healthcheck');

dotenv.config();

const { openRouter } = require('./v1/routes');

// const { CORS_ORIGIN } = process.env;
/*
const configurePassport = require('./v1/users/passport');

configurePassport(passport);
initScheduler();
*/
const app = express();
app.use(express.json());

app.use(healthcheck);
app.use('', openRouter);

/*
app.use(uploadTest);
app.use(passport.initialize());

app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/v1', authRouter);
app.use(graphQlRouter);

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

const errorHandler = (err) => {
  console.log(err);
};

app.use(errorHandler);
*/

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
      levels: ['log', 'error'],
    },
  )],
  tracesSampleRate: 1.0,
});

rootRouter.use(Sentry.Handlers.errorHandler());

app.use('/', rootRouter);

module.exports = app;
