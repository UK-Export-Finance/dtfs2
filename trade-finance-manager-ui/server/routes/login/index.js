const express = require('express');
const loginController = require('../../controllers/login');

const router = express.Router();

router.get('/', loginController.getLogin);

router.get('/logout', loginController.logout);

// Route /login/sso/redirect is set in generateApp.js to avoid CRSF check.

module.exports = router;
