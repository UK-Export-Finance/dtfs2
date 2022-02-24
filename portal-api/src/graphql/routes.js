const passport = require('passport');
const express = require('express');

const graphQlRouter = express.Router();

graphQlRouter.use(passport.authenticate('jwt', { session: false }));

graphQlRouter.route('/graphql');

module.exports = graphQlRouter;
