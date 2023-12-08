const express = require('express');
const { getUserHomepage } = require('../../controllers/home');

const router = express.Router();

router.get('/', getUserHomepage);

module.exports = router;
