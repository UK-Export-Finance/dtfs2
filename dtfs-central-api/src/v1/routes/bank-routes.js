const express = require('express');

const bankRouter = express.Router();

const getBankController = require('../controllers/bank/get-bank.controller');
const createBankController = require('../controllers/bank/create-bank.controller');

bankRouter.route('/')
  .post(
    createBankController.createBankPost,
  );

bankRouter.route('/:id')
  .get(
    getBankController.findOneBankGet,
  );


module.exports = bankRouter;
