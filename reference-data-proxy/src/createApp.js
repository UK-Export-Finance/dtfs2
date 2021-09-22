// const bodyParser = require('body-parser');
// const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
// const passport = require('passport');

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
app.use('/', rootRouter);

module.exports = app;
