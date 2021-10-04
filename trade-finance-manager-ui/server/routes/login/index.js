const express = require('express');
const loginController = require('../../controllers/login');

const router = express.Router();

router.get('/', loginController.getLogin);

router.post('/', loginController.postLogin);

router.get('/logout', loginController.logout);

module.exports = router;
