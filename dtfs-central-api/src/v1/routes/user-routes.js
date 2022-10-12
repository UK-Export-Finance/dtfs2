const express = require('express');
const { param } = require('express-validator');

const { createUserPost, findOnePortalUserGet, listAllPortalUsers } = require('../controllers/user');
const { hasValidationErrors } = require('../validation/hasValidationErrors.validate');

const userRouter = express.Router();
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
userRouter.route('/').post(createUserPost);

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
userRouter.route('/:userId').get(param('userId').isMongoId(), hasValidationErrors, findOnePortalUserGet);

userRouter.route('/').get(listAllPortalUsers);

module.exports = userRouter;
