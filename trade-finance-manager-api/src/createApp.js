const bodyParser = require('body-parser');
// const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
// const { SwaggerUIBundle } = require('swagger-ui-dist');
const swaggerUi = require('swagger-ui-express');

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

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Trade Finance Manager API',
    version: '1.0.0',
    description: 'Consumes deals and integrates with external APIs',
  },
  tags: [
    {
      name: 'Deals',
      description: '',
    },
    {
      name: 'Users',
      description: '',
    },
  ],
};
const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./src/v1/routes.js'],
});

const swaggerUiOptions = {
  explorer: true,
};

rootRouter.use('/v1/api-docs', swaggerUi.serve);
rootRouter.get('/v1/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use('/', rootRouter);

module.exports = app;
