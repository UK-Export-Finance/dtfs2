const express = require('express');

const graphQlRouter = express.Router();

graphQlRouter.route('/graphql');

module.exports = graphQlRouter;
