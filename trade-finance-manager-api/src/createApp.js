const bodyParser = require('body-parser');
// const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');

const { resolvers, typeDefs, graphQlRouter } = require('./graphql');

const healthcheck = require('./healthcheck');
const { openRouter } = require('./v1/routes');
const initScheduler = require('./scheduler');

dotenv.config();

// const { CORS_ORIGIN } = process.env;
initScheduler();

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));
app.use(healthcheck);
app.use('/v1', openRouter);

// app.use(cors({
//   origin: CORS_ORIGIN,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

app.use(graphQlRouter);

const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user,
  }),
  schema: schemaWithMiddleware,
});

server.applyMiddleware({ app });

// const errorHandler = (err) => {
//   console.log(err);
// };

// app.use(errorHandler);

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

app.use('/', rootRouter);

module.exports = app;
