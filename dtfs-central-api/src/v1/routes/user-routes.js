import express from 'express';

import * as getUserController from '../controllers/user/get-user.controller';
import * as createUserController from '../controllers/user/create-user.controller';

const userRouter = express.Router();

/**
 * @openapi
 * /user:
 *   post:
 *     deprecated: true
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
userRouter.route('/').post(createUserController.createUserPost);

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
userRouter.route('/:id').get(getUserController.findOneUserGet);

userRouter.route('/').get(getUserController.list);

export default userRouter;
