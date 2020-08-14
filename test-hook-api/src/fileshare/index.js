const express = require('express');
const sendTypeB = require('./sendTypeB');

const routes = express.Router();

routes.route('/typeB').post(sendTypeB);

module.exports = routes;
