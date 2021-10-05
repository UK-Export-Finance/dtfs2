const express = require('express');
const controller = require('../../controllers/deals');

const router = express.Router();

router.get('/', controller.getDeals);
router.post('/', controller.queryDeals);

module.exports = router;
