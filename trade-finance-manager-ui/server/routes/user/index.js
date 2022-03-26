const express = require('express');
const userController = require('../../controllers/user');

const router = express.Router();

router.get('/change-password', userController.getUserProfile);

router.post('/change-password', userController.postUserProfile);

module.exports = router;
