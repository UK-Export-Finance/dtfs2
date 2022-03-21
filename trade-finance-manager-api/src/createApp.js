const dotenv = require('dotenv');
const express = require('express');
const compression = require('compression');
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

const seo = require('./v1/middleware/headers/seo');

dotenv.config();

initScheduler();

const app = express();

app.use(seo);

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

server.applyMiddleware({ app });

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

rootRouter.use('/v1/api-docs', swaggerUi.serve);

app.use('/', rootRouter);

module.exports = app;
