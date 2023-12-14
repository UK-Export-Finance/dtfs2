const express = require('express');
const tasksController = require('../controllers/tasks.controller');
const validation = require('../validation/route-validators/route-validators');
const handleValidationResult = require('../validation/route-validators/validation-handler');

const tasksRouter = express.Router();

tasksRouter
  .route('/deals/:dealId/tasks/:groupId/:taskId')
  .put(
    validation.dealIdValidation,
    validation.groupIdValidation,
    validation.taskIdValidation,
    handleValidationResult,
    tasksController.updateTask,
  );

module.exports = {
  tasksRouter,
};
