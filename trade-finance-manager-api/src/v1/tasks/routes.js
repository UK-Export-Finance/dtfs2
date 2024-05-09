const express = require('express');
const tasksController = require('../controllers/tasks.controller');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');

const tasksRouter = express.Router();

tasksRouter
  .route('/deals/:dealId/tasks/:groupId/:taskId')
  .put(validation.dealIdValidation, validation.groupIdValidation, validation.taskIdValidation, handleExpressValidatorResult, tasksController.updateTask);

module.exports = {
  tasksRouter,
};
