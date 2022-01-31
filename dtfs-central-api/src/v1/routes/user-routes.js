const express = require('express');

const userRouter = express.Router();

const getUserController = require('../controllers/user/get-user.controller');
const createUserController = require('../controllers/user/create-user.controller');

/**
 * @openapi
 * /user:
 *   post:
 *     summary: Create a user in users collection
 *     tags: [User]
 *     description: Create a user in users collection
 *     requestBody:
 *       description: Fields required to create a users. No validation in place.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
userRouter.route('/')
  .post(
    createUserController.createUserPost,
  );

/**
 * @openapi
 * /user/:id:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     description: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/User'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       example: 123456abc
 *       404:
 *         description: Not found
 */
userRouter.route('/:id')
  .get(
    getUserController.findOneUserGet,
  );

userRouter.route('/')
  .get(
    getUserController.list,
  );

module.exports = userRouter;
