const express = require('express');

const userRouter = express.Router();

const getUserController = require('../controllers/user/get-user.controller');
const createUserController = require('../controllers/user/create-user.controller');

userRouter.route('/')
  .post(
    createUserController.createUserPost,
  );

userRouter.route('/:id')
  .get(
    getUserController.findOneUserGet,
  );

module.exports = userRouter;
