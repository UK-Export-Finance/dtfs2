const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');

const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const healthcheck = require('./healthcheck');

const { resolvers, typeDefs, graphQlRouter } = require('./graphql');
const { validateUserMiddleware } = require('./graphql/middleware');
const initScheduler = require('./scheduler');

dotenv.config();

const { CORS_ORIGIN } = process.env;

const configurePassport = require('./v1/users/passport');
const { authRouter, openRouter } = require('./v1/routes');

configurePassport(passport);
initScheduler();

const app = express();
app.use(healthcheck);
app.use(passport.initialize());
app.use(bodyParser.json({ type: 'application/json' }));

app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/v1', openRouter);
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

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});
app.use('/', rootRouter);

module.exports = app;
